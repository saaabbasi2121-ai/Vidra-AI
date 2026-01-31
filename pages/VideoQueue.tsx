import React, { useState, useEffect } from 'react';
import { GeneratedVideo, VideoPlatform } from '../types';
import { ICONS } from '../constants';
import { ExportService } from '../services/exportService';

const VideoQueue: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [previewStep, setPreviewStep] = useState(0);

  const queue: GeneratedVideo[] = [
    {
      id: 'v1',
      seriesId: '1',
      title: 'The Secret of Black Holes',
      script: 'Imagine a point where gravity is so strong that not even light can escape. Black holes are regions in space where mass is concentrated into an incredibly small volume. They challenge our understanding of physics.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
      status: 'Ready',
      scheduledAt: '2023-10-15T10:00:00Z',
      platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS]
    },
    {
      id: 'v2',
      seriesId: '1',
      title: 'Voyager 1: Final Frontier',
      script: 'Launched in 1977, Voyager 1 is the farthest human-made object from Earth. It has crossed into interstellar space, carrying a golden record with sounds from our home planet.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
      status: 'Generating',
      scheduledAt: '2023-10-16T10:00:00Z',
      platforms: [VideoPlatform.TIKTOK]
    },
    {
      id: 'v3',
      seriesId: '2',
      title: '5 Stoic Habits for Focus',
      script: 'Stoicism isn\'t about suppressing emotions; it\'s about focusing on what you can control. Rule one: Differentiate between internal and external events. Rule two: Amor Fati—love your fate.',
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

  const handleDownload = (video: GeneratedVideo) => {
    const bundle = {
      ...video,
      downloadedAt: new Date().toISOString(),
      vidra_engine: 'v1.0-stable'
    };
    ExportService.downloadProject(bundle, `vidra-${video.id}.json`);
  };

  // Preview Loop Simulation
  useEffect(() => {
    if (selectedVideo) {
      const interval = setInterval(() => {
        setPreviewStep(prev => (prev + 1) % 3);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedVideo]);

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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
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
                <tr key={video.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 aspect-[9/16] bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 shadow-lg relative">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thumb" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                          </svg>
                        </div>
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
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(video); }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Download Asset Bundle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
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
      
      {/* Preview Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl p-6 lg:p-10 shadow-2xl flex flex-col lg:flex-row gap-10 overflow-hidden relative">
            
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all z-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Mobile Player Simulation */}
            <div className="relative w-full max-w-[280px] aspect-[9/16] mx-auto lg:mx-0 flex-shrink-0 bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full">
                  <img src={selectedVideo.thumbnailUrl} className="w-full h-full object-cover opacity-80" alt="Preview Frame" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
               </div>

               {/* UI Overlays */}
               <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-center opacity-60">
                     <span className="text-[10px] font-bold text-white tracking-widest uppercase">Vidra Render</span>
                     <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                     </div>
                  </div>

                  <div className="space-y-4 mb-4">
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl animate-in slide-in-from-bottom-2">
                        <p className="text-white text-xs font-bold leading-tight">
                           {selectedVideo.script.split('. ')[previewStep] || selectedVideo.script}
                        </p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 border border-white/20"></div>
                        <div>
                           <p className="text-[10px] font-bold text-white">@faceless_vidra</p>
                           <p className="text-[8px] text-slate-300">Original Content • AI Voice</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Playback Progress */}
               <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                  <div className="h-full bg-indigo-500 transition-all duration-[3000ms] linear" style={{ width: `${(previewStep + 1) * 33.3}%` }}></div>
               </div>
            </div>

            {/* Video Details & Controls */}
            <div className="flex-1 space-y-8 py-4">
               <div>
                  <h2 className="text-3xl font-black text-white mb-2">{selectedVideo.title}</h2>
                  <div className="flex gap-3">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusStyle(selectedVideo.status)}`}>
                        {selectedVideo.status}
                     </span>
                     <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                        </svg>
                        Scheduled for {new Date(selectedVideo.scheduledAt).toLocaleString()}
                     </span>
                  </div>
               </div>

               <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6">
                  <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Complete Script</h4>
                  <p className="text-slate-300 text-sm leading-relaxed max-h-[150px] overflow-y-auto scrollbar-hide">
                    {selectedVideo.script}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleDownload(selectedVideo)}
                    className="flex items-center justify-center gap-3 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                     </svg>
                     Download Bundle
                  </button>
                  <button className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                     Post Now
                  </button>
               </div>

               <p className="text-center text-[10px] text-slate-500 font-medium">
                  Manual download includes raw script, voiceover prompts, and generated asset package.
               </p>
            </div>
          </div>
        </div>
      )}

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