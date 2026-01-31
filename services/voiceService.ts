
import { VoiceOption } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

const ELEVENLABS_API_KEY = (process.env as any).ELEVENLABS_API_KEY || '';

export class VoiceService {
  static async getVoices(): Promise<VoiceOption[]> {
    const defaultVoices: VoiceOption[] = [
      { id: 'Charon', name: 'Charon (Deep/Mysterious)', provider: 'Gemini' },
      { id: 'Puck', name: 'Puck (Energetic)', provider: 'Gemini' },
      { id: 'Kore', name: 'Kore (Professional)', provider: 'Gemini' },
      { id: 'Fenrir', name: 'Fenrir (Dark)', provider: 'Gemini' },
      { id: 'Zephyr', name: 'Zephyr (Smooth)', provider: 'Gemini' },
      { id: '21m00Tcm4lvcESmeDXWV', name: 'Rachel (Sweet)', provider: 'ElevenLabs' },
      { id: 'AZnzlk1XhxPqc80f0Hcf', name: 'Drew (News)', provider: 'ElevenLabs' }
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
      return [...defaultVoices.filter(v => v.provider === 'Gemini'), ...elVoices];
    } catch (err) {
      console.error("Failed to fetch ElevenLabs voices:", err);
      return defaultVoices;
    }
  }

  static async generateAudio(text: string, voiceId: string): Promise<string | null> {
    // If it's a Gemini voice or we don't have ElevenLabs key, use Gemini TTS
    if (!ELEVENLABS_API_KEY || ['Charon', 'Puck', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceId)) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceId.includes('Eleven') ? 'Kore' : voiceId },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          // Gemini returns raw PCM 24khz, but we can treat as blob for simple HTML5 Audio if wrapped or just use it
          // For simplicity in this browser environment, we convert the base64 to a data URI
          // Most browsers can handle 'audio/wav' or 'audio/mpeg' better, but 'audio/mp3' often works with data URIs
          return `data:audio/mp3;base64,${base64Audio}`;
        }
      } catch (err) {
        console.error("Gemini TTS failed:", err);
      }
    }

    // Fallback to ElevenLabs
    if (ELEVENLABS_API_KEY) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (err) {
        console.error("ElevenLabs TTS failed:", err);
      }
    }

    return null;
  }
}
