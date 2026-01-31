
export enum VideoPlatform {
  TIKTOK = 'TikTok',
  SHORTS = 'YouTube Shorts',
  REELS = 'Instagram Reels',
  GITHUB = 'GitHub'
}

export enum SubscriptionPlan {
  STARTER = 'Starter',
  DAILY = 'Daily',
  PRO = 'Pro'
}

export interface VoiceOption {
  id: string;
  name: string;
  previewUrl?: string;
  provider: 'ElevenLabs' | 'Gemini';
}

export interface SocialAccount {
  platform: VideoPlatform;
  username: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface VideoSeries {
  id: string;
  topic: string;
  description: string; // New field for deep context
  tone: string;
  style: string;
  voiceId: string;
  durationSeconds: number;
  platform: VideoPlatform;
  frequency: 'Daily' | '3x / week' | 'Weekly';
  isActive: boolean;
  createdAt: string;
  lastGeneration?: string;
}

export interface VideoScene {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface GeneratedVideo {
  id: string;
  seriesId?: string; // Optional for manual uploads
  title: string;
  script: string;
  scenes: VideoScene[];
  thumbnailUrl: string;
  videoUrl?: string; // For manual uploads
  status: 'Generating' | 'Ready' | 'Posted' | 'Failed';
  scheduledAt: string;
  platforms: VideoPlatform[];
  voiceId?: string;
  durationSeconds?: number;
  source: 'AI' | 'Manual'; // Differentiate between AI and user-uploaded
}

export interface PlanLimits {
  videosPerWeek: number;
  maxSeries: number;
  platforms: VideoPlatform[];
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.STARTER]: {
    videosPerWeek: 3,
    maxSeries: 1,
    platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS, VideoPlatform.REELS, VideoPlatform.GITHUB],
    features: ['Standard AI Voices', 'Watermark Included']
  },
  [SubscriptionPlan.DAILY]: {
    videosPerWeek: 7,
    maxSeries: 3,
    platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS, VideoPlatform.REELS, VideoPlatform.GITHUB],
    features: ['Premium AI Voices', 'No Watermark', 'Priority Generation']
  },
  [SubscriptionPlan.PRO]: {
    videosPerWeek: 14,
    maxSeries: 10,
    platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS, VideoPlatform.REELS, VideoPlatform.GITHUB],
    features: ['Custom Voice Cloning', 'Bulk Generation', 'API Access']
  }
};
