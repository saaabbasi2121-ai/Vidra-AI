
import { VoiceOption } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

// Gemini prebuilt voices: Charon, Puck, Kore, Fenrir, Zephyr
const GEMINI_VOICE_MAP: Record<string, string> = {
  // Male mappings
  'liam': 'zephyr',
  'james': 'charon',
  'robert': 'puck',
  'michael': 'fenrir',
  'william': 'zephyr',
  'david': 'charon',
  'richard': 'puck',
  'joseph': 'fenrir',
  'thomas': 'zephyr',
  'charles': 'charon',
  // Female mappings
  'emma': 'kore',
  'olivia': 'kore',
  'ava': 'kore',
  'isabella': 'kore',
  'sophia': 'kore',
  'charlotte': 'kore',
  'mia': 'kore',
  'amelia': 'kore',
  'harper': 'kore',
  'evelyn': 'kore',
};

export function decodeBase64ToUint8(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class VoiceService {
  static async getVoices(): Promise<VoiceOption[]> {
    const maleNames = ['Liam', 'James', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
    const femaleNames = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn'];

    const avatars: VoiceOption[] = [
      ...maleNames.map(name => ({
        id: name.toLowerCase(),
        name: `${name}`,
        provider: 'Gemini' as const,
        gender: 'Male' as const,
        description: 'Deep and resonant male tone.',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&gender=male`
      })),
      ...femaleNames.map(name => ({
        id: name.toLowerCase(),
        name: `${name}`,
        provider: 'Gemini' as const,
        gender: 'Female' as const,
        description: 'Soft and articulate female tone.',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&gender=female`
      }))
    ];

    return avatars;
  }

  static async generateGeminiTTS(text: string, voiceId: string): Promise<string | null> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    
    try {
      const actualVoice = GEMINI_VOICE_MAP[voiceId.toLowerCase()] || 'zephyr';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: actualVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (err) {
      console.error("Gemini TTS failed:", err);
      return null;
    }
  }
}
