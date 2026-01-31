
import React from 'react';
import { GeneratedVideo, VideoPlatform } from '../types';
import { ICONS } from '../constants';

const VideoQueue: React.FC = () => {
  const queue: GeneratedVideo[] = [
    {
      id: 'v1',
      seriesId: '1',
      title: 'The Secret of Black Holes',
      script: 'Imagine a point where gravity is so strong...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
      status: 'Ready',
      scheduledAt: '2023-10-15T10:00:00Z',
      platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS]
    },
    {
      id: 'v2',
      seriesId: '1',
      title: 'Voyager 1: Final Frontier',
      script: 'Traveling through space for decades...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
      status: 'Generating',
      scheduledAt: '2023-10-16T10:00:00Z',
      platforms: [VideoPlatform.TIKTOK]
    },
    {
      id: 'v3',
      seriesId: '2',
      title: '5 Stoic Habits for Focus',
      script: 'Epictetus once said...',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80',
      status: 'Posted',
      scheduledAt: '2023-10-14T09:00:00Z',
      platforms: [VideoPlatform.REELS]
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Generating': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'Posted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPlatformIcon = (platform: VideoPlatform) => {
    switch (platform) {
      case VideoPlatform.TIKTOK:
        return <ICONS.TikTok className="w-4 h-4" />;
      case VideoPlatform.SHORTS:
        return <ICONS.YouTubeShorts className="w-4 h-4" />;
      case VideoPlatform.REELS:
        return <ICONS.InstagramReels className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Publishing Queue</h1>
          <p className="text-slate-400">Scheduled automated posts and generation status</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl border border-slate-700 transition-colors">
            Filter: All Series
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Video Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Scheduled For</th>
                <th className="px-6 py-4">Platforms</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {queue.map((video) => (
                <tr key={video.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 aspect-[9/16] bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 shadow-lg">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thumb" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{video.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{video.script}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(video.status)}`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-300">
                      {new Date(video.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(video.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-1.5">
                      {video.platforms.map((p) => (
                        <div key={p} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-sm" title={p}>
                          {getPlatformIcon(p)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button className="p-2 bg-slate-800 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-8 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 border-dashed">
         <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">You have 12 video generations remaining this week.</p>
            <button className="text-indigo-400 text-sm font-bold hover:text-indigo-300">Upgrade for unlimited queue depth &rarr;</button>
         </div>
      </div>
    </div>
  );
};

export default VideoQueue;
