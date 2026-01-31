
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
    
    const sceneCount = Math.max(3, Math.floor(durationSeconds / 12));
    const targetWordCount = Math.floor(durationSeconds * 2.5);

    // Prompt heavily weighted on the unique description to prevent duplicate-style outputs
    const prompt = `
      Create a unique, viral short-form video script.
      SERIES NAME: ${topic}
      SERIES GENRE/CONTEXT: ${description}
      TONE: ${tone}
      VISUAL STYLE: ${style}
      DURATION: ${durationSeconds} seconds
      WORD COUNT: ~${targetWordCount} words

      IMPORTANT: Use the SERIES GENRE/CONTEXT to differentiate this from other videos on similar topics. 
      Focus on the specific angles and "vibe" described in the context.

      Structure the response as a JSON object with:
      - title: A catchy, unique title
      - hook: A high-retention 3-second opening
      - scenes: An array of exactly ${sceneCount} objects with { text, imagePrompt }
      - callToAction: A unique outro aligned with the niche
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
        parts: [{ text: `${prompt}. Cinematic, vertical 9:16, 4k resolution.` }]
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
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'
      });
    }

    return {
      ...script,
      scenes: scenesWithImages,
      thumbnailUrl: scenesWithImages[0]?.imageUrl
    };
  }
}
