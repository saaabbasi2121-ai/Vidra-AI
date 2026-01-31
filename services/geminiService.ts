
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
    
    // For 60s, we need about 6-8 scenes to keep the viewer engaged.
    const sceneCount = Math.max(6, Math.ceil(durationSeconds / 8));
    const targetWordCount = Math.floor((durationSeconds / 60) * 160);

    const prompt = `
      CRITICAL INSTRUCTION: You are a world-class viral content creator. 
      Generate a script for a video series.
      
      SERIES TOPIC: ${topic}
      USER'S SPECIFIC DESCRIPTION: "${description}"
      TONE: ${tone}
      ART STYLE: ${style}
      TOTAL VIDEO DURATION TARGET: ${durationSeconds} SECONDS

      STRICT CONTENT RULES:
      1. IGNORE ALL DEFAULT ASTRONOMY KNOWLEDGE. 
      2. If the USER'S DESCRIPTION is "Motivational quotes", you MUST ONLY generate motivational quotes.
      3. DO NOT return content about Space, Black Holes, or Stars unless explicitly mentioned in the DESCRIPTION.
      4. SCENE COUNT: Return EXACTLY ${sceneCount} scenes.
      5. SCENE LENGTH: To reach the ${durationSeconds}s target, EACH scene's "text" MUST be at least 25-30 words long.
      6. TOTAL WORDS: The sum of all scene text should be roughly ${targetWordCount} words.

      JSON FORMAT ONLY:
      {
        "title": "Viral Title",
        "hook": "Aggressive opening hook",
        "scenes": [
          { 
            "text": "A long paragraph of narration text (approx 30 words) that matches the user's description and tone perfectly.", 
            "imagePrompt": "A highly detailed, cinematic image prompt for an AI generator matching the ${style} style and scene context." 
          }
        ],
        "callToAction": "Engaging outro"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
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

    const parsed = JSON.parse(response.text || '{}');
    return parsed;
  }

  static async generateImage(prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality 9:16 vertical cinematic masterpiece: ${prompt}. Cinematic lighting, detailed textures, 8k resolution.` }]
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
    } catch (e) {
      console.error("Image generation failed", e);
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
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800' // Neutral abstract grey/blue
      });
    }

    return {
      ...script,
      scenes: scenesWithImages,
      thumbnailUrl: scenesWithImages[0]?.imageUrl
    };
  }
}
