
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
  provider: 'ElevenLabs' | 'Gemini';
  gender: 'Male' | 'Female';
  avatarUrl?: string;
  description?: string;
}

export interface NicheCategory {
  id: string;
  name: string;
  description: string;
  group: 'Mindset' | 'Finance' | 'Entertainment' | 'Tech' | 'Lifestyle' | 'Trivia' | 'Horror' | 'Nature';
  tone: string;
  style: string;
  icon: string;
  suggestedVoiceId?: string;
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
  description: string;
  tone: string;
  style: string;
  voiceId: string;
  durationSeconds: number;
  platform: VideoPlatform;
  frequency: 'Daily' | '3x / week' | 'Weekly';
  isActive: boolean;
  createdAt: string;
  nicheId?: string;
}

export interface VideoScene {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface GeneratedVideo {
  id: string;
  seriesId?: string;
  title: string;
  script: string;
  scenes: VideoScene[];
  thumbnailUrl: string;
  status: 'Generating' | 'Ready' | 'Posted' | 'Failed';
  scheduledAt: string;
  platforms: VideoPlatform[];
  voiceId?: string;
  durationSeconds?: number;
  source: 'AI' | 'Manual';
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
