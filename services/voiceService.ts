
import { VoiceOption } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

const ELEVENLABS_API_KEY = (process.env as any).ELEVENLABS_API_KEY || '';

// Helper for decoding base64 to Uint8Array
export function decodeBase64ToUint8(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for decoding raw PCM data into an AudioBuffer
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
    const defaultVoices: VoiceOption[] = [
      { id: 'Charon', name: 'Charon (Deep/Mysterious)', provider: 'Gemini' },
      { id: 'Puck', name: 'Puck (Energetic)', provider: 'Gemini' },
      { id: 'Kore', name: 'Kore (Professional)', provider: 'Gemini' },
      { id: 'Fenrir', name: 'Fenrir (Dark)', provider: 'Gemini' },
      { id: 'Zephyr', name: 'Zephyr (Smooth)', provider: 'Gemini' },
    ];

    if (!ELEVENLABS_API_KEY) return defaultVoices;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY }
      });
      const data = await response.json();
      const elVoices = data.voices.map((v: any) => ({
        id: v.voice_id,
        name: `${v.name} (Eleven)`,
        previewUrl: v.preview_url,
        provider: 'ElevenLabs'
      }));
      return [...defaultVoices, ...elVoices];
    } catch (err) {
      console.error("Failed to fetch ElevenLabs voices:", err);
      return defaultVoices;
    }
  }

  static async generateGeminiTTS(text: string, voiceId: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceId === 'Rachel (Sweet)' || voiceId.includes('Eleven') ? 'Kore' : voiceId },
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
