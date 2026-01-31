
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private static getAI() {
    if (!API_KEY) {
      throw new Error("API Key not found. Please ensure process.env.API_KEY is configured.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
  }

  static async testConnection() {
    try {
      const ai = this.getAI();
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'hi',
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  static async generateScript(topic: string, tone: string, style: string) {
    const ai = this.getAI();
    const prompt = `
      Create a viral short-form video script (approx 45-60 seconds) for a faceless video.
      Topic: ${topic}
      Tone: ${tone}
      Visual Style: ${style}

      Structure the response as a JSON object with:
      - title: A catchy title
      - hook: The first 3 seconds to grab attention
      - scenes: An array of 4 objects, each with { text: "voiceover line", imagePrompt: "detailed prompt for image generation" }
      - callToAction: End with a subscribe/follow prompt
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
                }
              }
            },
            callToAction: { type: Type.STRING }
          },
          required: ['title', 'hook', 'scenes', 'callToAction']
        }
      }
    });

    return JSON.parse(response.text);
  }

  static async generateImage(prompt: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}. High resolution, vertical 9:16 aspect ratio, cinematic photography, professional lighting.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }

  /**
   * Generates a complete video bundle (script + images) for a series.
   */
  static async generateFullVideoBundle(topic: string, tone: string, style: string) {
    const script = await this.generateScript(topic, tone, style);
    const scenesWithImages = [];
    
    // Generate images for all scenes
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
