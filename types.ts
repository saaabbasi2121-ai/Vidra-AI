
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

export interface SocialAccount {
  platform: VideoPlatform;
  username: string;
  avatarUrl?: string;
  isConnected: boolean;
  lastSync?: string;
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

export interface VideoSeries {
  id: string;
  topic: string;
  tone: string;
  style: string;
  platform: VideoPlatform;
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly';
  isActive: boolean;
  createdAt: string;
  lastGeneration?: string;
}

export interface GeneratedVideo {
  id: string;
  seriesId: string;
  title: string;
  script: string;
  thumbnailUrl: string;
  videoUrl?: string;
  status: 'Generating' | 'Ready' | 'Posted' | 'Failed';
  scheduledAt: string;
  platforms: VideoPlatform[];
}

export interface UserProfile {
  name: string;
  email: string;
  plan: SubscriptionPlan;
  videosCreatedThisWeek: number;
  totalViews: number;
  socialAccounts: SocialAccount[];
}
