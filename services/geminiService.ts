
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  
  private static getClient() {
    const apiKey = process.env.API_KEY || "";
    return new GoogleGenAI({ apiKey });
  }

  static async testConnection() {
    try {
      const client = this.getClient();
      await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'ping',
      });
      return { success: true };
    } catch (error: any) {
      console.error("API Connection Test Failed:", error);
      return { 
        success: false, 
        error: error.message || "Connection failed. Please verify your project billing and API key." 
      };
    }
  }

  static async generateScript(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'liam') {
    const sceneCount = Math.max(4, Math.ceil(durationSeconds / 9));
    const targetWordCount = Math.floor((durationSeconds / 60) * 150); 
    const randomSeed = Math.random().toString(36).substring(7);

    const prompt = `
      You are an expert faceless content strategist. Create a VIRAL script bundle.
      
      SERIES CONTEXT:
      - NICHE NAME: ${topic}
      - NICHE RULES: "${description}"
      - TONE: ${tone}
      - VISUAL STYLE: ${style}
      - TARGET DURATION: ${durationSeconds} SECONDS
      - UNIQUE ID: ${randomSeed}

      STRICT CONTENT RULES:
      1. THEMATIC VARIETY: Do NOT use generic space, nebula, or abstract "mind" imagery unless explicitly requested by the niche.
      2. CHARACTER ANCHOR: Define a specific visual subject (e.g., "A bearded monk in orange robes", "A futuristic sleek silver robot", "A 1920s detective in a trench coat"). This subject MUST appear in all scenes.
      3. DURATION: Return EXACTLY ${sceneCount} distinct scenes.
      4. WORD COUNT: Total script length MUST be approximately ${targetWordCount} words.
      5. HOOK: Start with a high-retention hook.

      JSON STRUCTURE:
      {
        "title": "A unique catchy title",
        "characterAnchor": "A highly detailed visual description of the consistent subject for image prompts",
        "hook": "Opening hook text",
        "scenes": [
          { 
            "text": "Narration for this segment", 
            "imagePrompt": "A specific action or background description. Do NOT repeat the character description here, just the action and environment." 
          }
        ],
        "callToAction": "Closing statement"
      }
    `;

    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
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
      throw e;
    }
  }

  static async generateImage(prompt: string, anchor: string, style: string) {
    try {
      const fullPrompt = `Vertical 9:16 cinematic frame. Style: ${style}. Subject: ${anchor}. Scene Action: ${prompt}. High detail, photorealistic, 8k, vibrant lighting.`;
      
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { imageConfig: { aspectRatio: "9:16" } }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) return null;

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e: any) {
      console.error("Image gen failed:", e);
      throw e;
    }
    return null;
  }

  static async generateFullVideoBundle(topic: string, description: string, tone: string, style: string, durationSeconds: number = 60, voiceId: string = 'liam', onProgress?: (msg: string) => void) {
    if (onProgress) onProgress("Architecting Unique Narrative...");
    const script = await this.generateScript(topic, description, tone, style, durationSeconds, voiceId);
    
    if (onProgress) onProgress(`Visualizing ${script.scenes.length} Scenes...`);
    const scenesWithImages = [];
    
    for (let i = 0; i < script.scenes.length; i++) {
      if (onProgress) onProgress(`Rendering Scene ${i + 1}/${script.scenes.length}: ${script.scenes[i].imagePrompt.substring(0, 30)}...`);
      
      const imageUrl = await this.generateImage(script.scenes[i].imagePrompt, script.characterAnchor, style);
      
      scenesWithImages.push({
        ...script.scenes[i],
        imageUrl: imageUrl || `https://placehold.co/1080x1920/1e293b/white?text=Scene+${i+1}+Rendering+Failed`
      });
    }

    return {
      ...script,
      scenes: scenesWithImages,
      thumbnailUrl: scenesWithImages[0]?.imageUrl
    };
  }
}
