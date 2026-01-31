
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

  static async generateScript(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'Charon') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calculate scenes for actual coverage. 
    // Average speaking rate is ~130-150 words per minute.
    const sceneCount = Math.max(6, Math.ceil(durationSeconds / 8));
    const targetWordCount = Math.floor((durationSeconds / 60) * 150);
    const randomSeed = Math.random().toString(36).substring(7);

    const prompt = `
      CRITICAL SYSTEM OVERRIDE: 
      You are an expert faceless content strategist. 
      
      SERIES CONTEXT:
      - TOPIC: ${topic}
      - GENRE/DESCRIPTION: "${description}"
      - TONE: ${tone}
      - VISUAL STYLE: ${style}
      - TARGET DURATION: ${durationSeconds} SECONDS
      - SELECTED VOICE: ${voiceId}
      - RANDOM SEED: ${randomSeed}

      STRICT CONTENT RULES:
      1. FORBIDDEN THEMES: Space, Galaxies, Planets, Stars, Black Holes.
      2. CONSISTENCY: You MUST define a "characterAnchor". This is a detailed description of the main subject/character that will appear in ALL scenes.
      3. RHYTHM: The script must be tailored for the ${voiceId} voice. 
      4. DURATION COMPLIANCE: Return EXACTLY ${sceneCount} scenes.
      5. WORD COUNT: Total script length MUST be approximately ${targetWordCount} words. Each scene text should be roughly ${Math.floor(targetWordCount / sceneCount)} words to ensure the video lasts exactly ${durationSeconds} seconds.

      JSON STRUCTURE:
      {
        "title": "A unique viral title",
        "characterAnchor": "Detailed physical description of the subject",
        "hook": "Strong opening hook",
        "scenes": [
          { 
            "text": "Specific narration text matching the duration requirement...", 
            "imagePrompt": "Action/setting only. The characterAnchor will be added automatically." 
          }
        ],
        "callToAction": "Outro"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            characterAnchor: { type: Type.STRING },
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
          required: ['title', 'characterAnchor', 'hook', 'scenes', 'callToAction']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }

  static async generateImage(prompt: string, anchor: string, style: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `Vertical 9:16 high-quality cinematic frame. Subject: ${anchor}. Scene: ${prompt}. Art Style: ${style}. Professional photography, hyper-detailed, consistent character appearance, 8k resolution.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }]
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
      console.error("Visual gen failed:", e);
    }
    return null;
  }

  static async generateFullVideoBundle(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'Charon', onProgress?: (msg: string) => void) {
    if (onProgress) onProgress("Developing Unique Script...");
    const script = await this.generateScript(topic, description, tone, style, durationSeconds, voiceId);
    
    if (onProgress) onProgress(`Defining Visual Anchor: ${script.characterAnchor.substring(0, 30)}...`);
    
    const scenesWithImages = [];
    for (let i = 0; i < script.scenes.length; i++) {
      if (onProgress) onProgress(`Visualizing Scene ${i + 1}/${script.scenes.length}...`);
      const imageUrl = await this.generateImage(script.scenes[i].imagePrompt, script.characterAnchor, style);
      scenesWithImages.push({
        ...script.scenes[i],
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800'
      });
    }

    return {
      ...script,
      scenes: scenesWithImages,
      thumbnailUrl: scenesWithImages[0]?.imageUrl
    };
  }
}
