
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  
  static async testConnection() {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'ping',
      });
      return { success: true };
    } catch (error) {
      console.error("Connection test failed:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async generateScript(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calculate required scene count to hit duration (average 10-12s per scene)
    const sceneCount = Math.max(4, Math.ceil(durationSeconds / 10));
    // Average speaking speed: 150 words per minute. 60s = 150 words.
    const targetWordCount = Math.floor((durationSeconds / 60) * 150);

    const prompt = `
      You are an expert viral content creator for TikTok and YouTube Shorts.
      Generate a script for a new video series.

      SERIES TITLE: ${topic}
      USER-DEFINED GENRE/DESCRIPTION: "${description}"
      TONE: ${tone}
      VISUAL ART STYLE: ${style}
      TARGET DURATION: ${durationSeconds} seconds
      TOTAL WORD COUNT REQUIRED: Approx ${targetWordCount} words

      STRICT CONSTRAINTS:
      1. IGNORE DEFAULT KNOWLEDGE. DO NOT generate space facts or general science unless the DESCRIPTION explicitly asks for them.
      2. FOLLOW THE DESCRIPTION EXACTLY. If the user says "Motivational quotes", write 100% motivational content.
      3. SCENE COUNT: You MUST return EXACTLY ${sceneCount} scenes.
      4. PACING: Each scene's "text" must be long enough to last ~10 seconds when spoken (roughly 25-30 words per scene).
      5. IMAGE PROMPTS: Make them highly detailed, cinematic, and matched to the ${style} style.

      JSON STRUCTURE REQUIRED:
      {
        "title": "Unique viral title",
        "hook": "Aggressive 3-second opening hook",
        "scenes": [
          { "text": "Scene narration text (30 words)", "imagePrompt": "Detailed cinematic prompt for AI image gen" }
        ],
        "callToAction": "Niche-specific outro"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgrade to Pro for better instruction following
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                },
                required: ['text', 'imagePrompt']
              }
            },
            callToAction: { type: Type.STRING }
          },
          required: ['title', 'hook', 'scenes', 'callToAction']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  static async generateImage(prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Vertical 9:16 high-quality cinematic masterpiece. ${prompt}. Professional photography, 8k, detailed textures, volumetric lighting.` }]
      },
      config: {
        imageConfig: { aspectRatio: "9:16" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }

  static async generateFullVideoBundle(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60) {
    const script = await this.generateScript(topic, description, tone, style, durationSeconds);
    const scenesWithImages = [];
    
    for (const scene of script.scenes) {
      const imageUrl = await this.generateImage(scene.imagePrompt);
      scenesWithImages.push({
        ...scene,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800'
      });
    }

    return {
      ...script,
      scenes: scenesWithImages,
      thumbnailUrl: scenesWithImages[0]?.imageUrl
    };
  }
}
