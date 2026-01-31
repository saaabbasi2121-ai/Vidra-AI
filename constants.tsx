
import { NicheCategory } from './types';

export const COLORS = {
  primary: '#6366f1',
  secondary: '#1e293b',
  accent: '#f43f5e',
  success: '#10b981',
  warning: '#f59e0b',
  background: '#0f172a'
};

const BASE_NICHES: NicheCategory[] = [
  // Mindset & Psychology
  { id: 'stoic-wisdom', name: 'Stoic Wisdom', group: 'Mindset', icon: '🏛️', tone: 'Calm & Profound', style: 'Moody Cinematic Photography', description: 'Ancient lessons from Marcus Aurelius focused on mental resilience.', suggestedVoiceId: 'charon' },
  { id: 'dark-psychology', name: 'Dark Psychology', group: 'Mindset', icon: '🧠', tone: 'Mysterious', style: 'High Contrast Noir', description: 'Exploring the hidden tactics of human behavior and manipulation.', suggestedVoiceId: 'fenrir' },
  { id: 'daily-motivation', name: 'Elite Motivation', group: 'Mindset', icon: '🔥', tone: 'High-Energy', style: 'Urban Gritty Photography', description: 'Aggressive success-oriented motivation for peak performance.', suggestedVoiceId: 'puck' },
  { id: 'growth-mindset', name: 'Habit Lab', group: 'Mindset', icon: '🌱', tone: 'Inspirational', style: 'Clean Minimalist 3D', description: 'Science-backed tips on learning and habit formation.', suggestedVoiceId: 'zephyr' },
  { id: 'morning-zen', name: 'Morning Zen', group: 'Mindset', icon: '🌅', tone: 'Serene', style: 'Soft Aesthetic Landscapes', description: 'Mindful starts and breathing exercises for focus.', suggestedVoiceId: 'kore' },
  
  // Finance & Business
  { id: 'crypto-pulse', name: 'Crypto Pulse', group: 'Finance', icon: '₿', tone: 'Urgent & Hype', style: 'Cyberpunk Neon Digital Art', description: 'Fast-paced Bitcoin and Altcoin trends and market shifts.', suggestedVoiceId: 'puck' },
  { id: 'wealth-engine', name: 'Passive Wealth', group: 'Finance', icon: '💸', tone: 'Optimistic', style: 'Luxury Lifestyle Photography', description: 'Side hustles and automated income stream blueprints.', suggestedVoiceId: 'zephyr' },
  { id: 'stock-secrets', name: 'Stock Secrets', group: 'Finance', icon: '📈', tone: 'Educational', style: 'Corporate Professional', description: 'Simplifying market concepts for long-term investing.', suggestedVoiceId: 'james' },
  { id: 'ecommerce-hacks', name: 'E-com Pro', group: 'Finance', icon: '📦', tone: 'Direct', style: 'Bright Clean Studio', description: 'Dropshipping and Amazon FBA success strategies.', suggestedVoiceId: 'liam' },
  
  // Trivia & Knowledge
  { id: 'galactic-facts', name: 'Galactic Facts', group: 'Trivia', icon: '🚀', tone: 'Awe-Inspiring', style: 'NASA-style Deep Space', description: 'Mind-blowing facts about the universe and astronomy.', suggestedVoiceId: 'charon' },
  { id: 'history-vault', name: 'History Vault', group: 'Trivia', icon: '📜', tone: 'Mysterious', style: 'Vintage Sepia Tint', description: 'Unsolved mysteries and weird historical occurrences.', suggestedVoiceId: 'fenrir' },
  { id: 'wild-world', name: 'Wild World', group: 'Trivia', icon: '🦁', tone: 'Engaging', style: 'Wildlife Photography', description: 'Crazy behaviors and survival facts of animals.', suggestedVoiceId: 'puck' },
  { id: 'ocean-depths', name: 'Abyss Stories', group: 'Trivia', icon: '🌊', tone: 'Eerie', style: 'Deep Sea Blue Photography', description: 'Terrifying and beautiful facts about the deep ocean.', suggestedVoiceId: 'charon' },
  
  // Horror & Mystery
  { id: 'scary-tales', name: 'Midnight Tales', group: 'Horror', icon: '👹', tone: 'Chilling', style: 'Dark Gritty Horror Art', description: 'Short horror stories and modern urban legends.', suggestedVoiceId: 'fenrir' },
  { id: 'crime-file', name: 'True Crime File', group: 'Horror', icon: '⚖️', tone: 'Serious', style: 'Documentary Realism', description: 'Brief breakdowns of cold cases and mysterious crimes.', suggestedVoiceId: 'charon' },
  { id: 'paranormal', name: 'Glitch in Reality', group: 'Horror', icon: '👻', tone: 'Unsettling', style: 'CCTV Grainy Footage Style', description: 'Stories of supernatural events and parallel realities.', suggestedVoiceId: 'fenrir' },

  // Tech & Future
  { id: 'ai-news', name: 'AI Revolution', group: 'Tech', icon: '🤖', tone: 'Visionary', style: 'Sleek Futuristic 3D', description: 'Daily breakthroughs in ChatGPT, robotics, and automation.', suggestedVoiceId: 'zephyr' },
  { id: 'gadget-lab', name: 'Gadget Lab', group: 'Tech', icon: '📱', tone: 'Curious', style: 'Macro Product Photography', description: 'Checking out the weirdest and coolest tech gadgets.', suggestedVoiceId: 'liam' },
  { id: 'code-snippets', name: 'Code Snippets', group: 'Tech', icon: '💻', tone: 'Helpful', style: 'Dark Matrix Coding Art', description: 'Quick programming tricks and dev tips.', suggestedVoiceId: 'sophia' },
];

// Procedurally generate 100 niches to fill the catalog
export const NICHE_CATEGORIES: NicheCategory[] = [...BASE_NICHES];
const groups = ['Mindset', 'Finance', 'Entertainment', 'Tech', 'Lifestyle', 'Trivia', 'Horror', 'Nature'] as const;
const styles = ['Cinematic Photography', '3D Render', 'Anime Style', 'Vintage Film', 'Vector Art'];
const voices = ['liam', 'emma', 'james', 'olivia', 'robert', 'ava', 'michael', 'isabella', 'william', 'sophia'];

for (let i = NICHE_CATEGORIES.length; i < 100; i++) {
  const g = groups[i % groups.length];
  NICHE_CATEGORIES.push({
    id: `niche-auto-${i}`,
    name: `${g} Explorer ${i}`,
    group: g as any,
    icon: '✨',
    tone: 'Viral & Engaging',
    style: styles[i % styles.length],
    description: `A unique automated content series focusing on niche ${g.toLowerCase()} viral hooks and trends.`,
    suggestedVoiceId: voices[i % voices.length]
  });
}

export const ICONS = {
  Dashboard: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25A2.25 2.25 0 0 1 10.5 15.75V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  ),
  Series: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m-15 0a2.25 2.25 0 0 0-1.5 2.122v5.25a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-5.25a2.25 2.25 0 0 0-1.5-2.122m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128" />
    </svg>
  ),
  Queue: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
  ),
  Billing: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
    </svg>
  ),
  Settings: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774a1.125 1.125 0 0 1 .12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738a1.125 1.125 0 0 1-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.45.12l-.737-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.383-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.164-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.398-.165.71-.505.78-.93l.15-.894Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  Link: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  TikTok: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1 .05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  ),
  YouTubeShorts: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.71 5.04c-1.18-.68-2.61-.43-3.41.6L12.5 8.1c-.26.33-.7.44-1.08.26l-1.63-.73c-.93-.42-1.99-.1-2.52.76-.53.86-.3 1.95.54 2.54l1.63.73a.853.853 0 0 1 .49 1.11l-1.8 4.46a2.04 2.04 0 0 0 .54 2.54c.48.34 1.05.51 1.62.51.68 0 1.35-.25 1.88-.74l1.8-4.46c.26-.33.7-.44 1.08-.26l1.63.73c.93.42 1.99.1 2.52-.76.53-.86.3-1.95-.54-2.54l-1.63-.73a.853.853 0 0 1-.49-1.11l1.8-4.46c.14-.34.21-.7.21-1.05 0-.75-.31-1.46-.86-1.85zM10.16 14.54l-.01-5.08 4.4 2.53-4.39 2.55z" />
    </svg>
  ),
  InstagramReels: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M2 10h20M2 7l3-5h4l-3 5h4l-3 5h4l-3 5h4l-3 5M10 14l4 3-4 3v-6z" />
    </svg>
  ),
  GitHub: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.164 22 16.409 22 12.017 22 6.484 17.522 2 12 2z" />
    </svg>
  )
};
