
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Always use process.env.API_KEY directly when initializing the @google/genai client instance.
export class GeminiService {
  
  // Fix: Added testConnection method to check API availability as requested by GeneratorDemo.tsx
  static async testConnection() {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Guideline: For basic text tasks, use 'gemini-3-flash-preview'.
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

  static async generateScript(topic: string, tone: string, style: string, durationSeconds: number = 60) {
    // Guideline: Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calculate approximate scene count based on duration (avg 1 scene per 10-15 seconds)
    const sceneCount = Math.max(3, Math.floor(durationSeconds / 12));
    const targetWordCount = Math.floor(durationSeconds * 2.5); // ~150 words per minute

    const prompt = `
      Create a viral short-form video script for a faceless video.
      Topic: ${topic}
      Tone: ${tone}
      Visual Style: ${style}
      Target Duration: ${durationSeconds} seconds
      Target Word Count: ~${targetWordCount} words

      Structure the response as a JSON object with:
      - title: A catchy title
      - hook: The first 3 seconds to grab attention
      - scenes: An array of exactly ${sceneCount} objects, each with { text: "voiceover line (approx ${Math.floor(targetWordCount/sceneCount)} words)", imagePrompt: "detailed prompt for image generation" }
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

    // Guideline: Use the .text property (not a method) to get generated text.
    return JSON.parse(response.text || '{}');
  }

  static async generateImage(prompt: string) {
    // Guideline: Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      // Guideline: Generate images using 'gemini-2.5-flash-image' by default.
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

    // Guideline: Iterate through all parts to find the image part; do not assume the first part is an image.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  }

  static async generateFullVideoBundle(topic: string, tone: string, style: string, durationSeconds: number = 60) {
    const script = await this.generateScript(topic, tone, style, durationSeconds);
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
