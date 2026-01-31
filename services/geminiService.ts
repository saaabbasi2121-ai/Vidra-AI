
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  
  private static getClient() {
    // We use process.env.API_KEY directly as required.
    // If it's missing, we still try to initialize to allow the platform's 
    // injection mechanisms a chance to work or the SDK to provide the correct error.
    const apiKey = process.env.API_KEY || "";
    return new GoogleGenAI({ apiKey });
  }

  static async testConnection() {
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'ping',
      });
      return { success: true };
    } catch (error: any) {
      console.error("API Connection Test Failed:", error);
      return { 
        success: false, 
        error: error.message || "Connection failed. Please check your API key configuration." 
      };
    }
  }

  static async generateScript(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'liam') {
    const ai = this.getClient();
    
    const sceneCount = Math.max(4, Math.ceil(durationSeconds / 9));
    const targetWordCount = Math.floor((durationSeconds / 60) * 150); 
    const randomSeed = Math.random().toString(36).substring(7);

    const prompt = `
      You are an expert faceless content strategist.
      
      SERIES CONTEXT:
      - NICHE NAME: ${topic}
      - NICHE RULES: "${description}"
      - TONE: ${tone}
      - VISUAL STYLE: ${style}
      - TARGET DURATION: ${durationSeconds} SECONDS
      - UNIQUE SEED: ${randomSeed}

      STRICT CONTENT RULES:
      1. THEMATIC CONSISTENCY: Strictly adhere to the "NICHE RULES".
      2. VISUAL ANCHOR: Define a "characterAnchor" (detailed physical description of the subject).
      3. DURATION: Return EXACTLY ${sceneCount} scenes.
      4. WORD COUNT: Total script length MUST be approximately ${targetWordCount} words.

      JSON STRUCTURE:
      {
        "title": "Viral Title",
        "characterAnchor": "Subject description for image generation",
        "hook": "Opening hook",
        "scenes": [
          { "text": "Narration text", "imagePrompt": "Visual action" }
        ],
        "callToAction": "Outro"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
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
    } catch (e: any) {
      console.error("Script Generation Error:", e);
      throw new Error(e.message || "Generation Failed");
    }
  }

  static async generateImage(prompt: string, anchor: string, style: string) {
    try {
      const ai = this.getClient();
      const fullPrompt = `Vertical 9:16 cinematic frame. Subject: ${anchor}. Scene: ${prompt}. Art Style: ${style}. High detail, 8k, consistent subject.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { imageConfig: { aspectRatio: "9:16" } }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Image gen failed:", e);
    }
    return null;
  }

  static async generateFullVideoBundle(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'liam', onProgress?: (msg: string) => void) {
    if (onProgress) onProgress("Developing Unique Script...");
    const script = await this.generateScript(topic, description, tone, style, durationSeconds, voiceId);
    
    if (onProgress) onProgress(`Visualizing Scenes...`);
    const scenesWithImages = [];
    for (let i = 0; i < script.scenes.length; i++) {
      if (onProgress) onProgress(`Synthesizing Visual ${i + 1}/${script.scenes.length}...`);
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
