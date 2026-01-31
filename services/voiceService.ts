
import { VoiceOption } from '../types';

// Note: In a real app, the API key should be handled via server-side proxy or secure env
const ELEVENLABS_API_KEY = (process.env as any).ELEVENLABS_API_KEY || '';

export class VoiceService {
  static async getVoices(): Promise<VoiceOption[]> {
    // Static list of popular ElevenLabs voices as fallback/default
    const defaultVoices: VoiceOption[] = [
      { id: '21m00Tcm4lvcESmeDXWV', name: 'Rachel (Sweet)', provider: 'ElevenLabs' },
      { id: 'AZnzlk1XhxPqc80f0Hcf', name: 'Drew (News)', provider: 'ElevenLabs' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Soft)', provider: 'ElevenLabs' },
      { id: 'MF3mGyEYCl7XYW7Lecd6', name: 'Marcus (Deep)', provider: 'ElevenLabs' },
      { id: 'TxGEqnSAs9V0p9S9f4N4', name: 'Bill (Old)', provider: 'ElevenLabs' },
      { id: 'gemini-kore', name: 'Kore (Gemini)', provider: 'Gemini' },
      { id: 'gemini-puck', name: 'Puck (Gemini)', provider: 'Gemini' }
    ];

    if (!ELEVENLABS_API_KEY) return defaultVoices;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY }
      });
      const data = await response.json();
      return data.voices.map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        previewUrl: v.preview_url,
        provider: 'ElevenLabs'
      }));
    } catch (err) {
      console.error("Failed to fetch ElevenLabs voices:", err);
      return defaultVoices;
    }
  }

  static async generateAudio(text: string, voiceId: string): Promise<string | null> {
    if (!ELEVENLABS_API_KEY) {
      console.warn("No ElevenLabs API Key. Voice-over simulation active.");
      return null;
    }

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
      console.error("Voice-over generation failed:", err);
      return null;
    }
  }
}
