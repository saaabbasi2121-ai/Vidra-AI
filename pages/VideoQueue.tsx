
import React, { useState, useEffect } from 'react';
import { GeneratedVideo, VideoPlatform, VideoSeries } from '../types';
import { ICONS } from '../constants';
import { ExportService } from '../services/exportService';
import { GeminiService } from '../services/geminiService';

const VideoQueue: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [previewStep, setPreviewStep] = useState(0);
  const [queue, setQueue] = useState<GeneratedVideo[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [seriesList, setSeriesList] = useState<VideoSeries[]>([]);

  useEffect(() => {
    const savedVideos = localStorage.getItem('vidra_videos');
    const savedSeries = localStorage.getItem('vidra_series');
    
    if (savedVideos) {
      setQueue(JSON.parse(savedVideos));
    } else {
      // Default placeholder if none exist
      const initial: GeneratedVideo[] = [{
        id: 'v1',
        seriesId: '1',
        title: 'The Secret of Black Holes',
        script: 'Imagine a point where gravity is so strong that not even light can escape.',
        scenes: [
          { text: "Imagine a point where gravity is so strong...", imagePrompt: "Black hole cinematic", imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80" },
          { text: "...that not even light can escape.", imagePrompt: "Event horizon space", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80" }
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
        status: 'Ready',
        scheduledAt: new Date().toISOString(),
        platforms: [VideoPlatform.TIKTOK]
      }];
      setQueue(initial);
      localStorage.setItem('vidra_videos', JSON.stringify(initial));
    }

    if (savedSeries) setSeriesList(JSON.parse(savedSeries));
  }, []);

  const saveQueue = (newQueue: GeneratedVideo[]) => {
    setQueue(newQueue);
    localStorage.setItem('vidra_videos', JSON.stringify(newQueue));
  };

  const handleRegenerate = async (video: GeneratedVideo) => {
    setIsRegenerating(true);
    try {
      // Find the series config to know the topic and style
      const series = seriesList.find(s => s.id === video.seriesId);
      if (!series) throw new Error("Series config lost.");

      const bundle = await GeminiService.generateFullVideoBundle(series.topic, series.tone, series.style);
      
      const updatedVideo: GeneratedVideo = {
        ...video,
        title: bundle.title,
        script: bundle.hook + " " + bundle.scenes.map((s: any) => s.text).join(" "),
        scenes: bundle.scenes,
        thumbnailUrl: bundle.thumbnailUrl,
        status: 'Ready'
      };

      const newQueue = queue.map(v => v.id === video.id ? updatedVideo : v);
      saveQueue(newQueue);
      setSelectedVideo(updatedVideo);
      setPreviewStep(0);
    } catch (err) {
      console.error("Regeneration failed", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = (video: GeneratedVideo) => {
    ExportService.downloadProject(video, `vidra-${video.id}.json`);
  };

  // Autoplay Logic for Preview
  useEffect(() => {
    if (selectedVideo && !isRegenerating) {
      const interval = setInterval(() => {
        setPreviewStep(prev => (prev + 1) % (selectedVideo.scenes?.length || 1));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedVideo, isRegenerating]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Vidra Video Hub</h1>
          <p className="text-slate-400">Preview, edit, and post your automated content.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-8 py-5">Content Preview</th>
                <th className="px-8 py-5">Series</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {queue.map((video) => (
                <tr key={video.id} className="hover:bg-indigo-500/5 transition-all group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 aspect-[9/16] bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 flex-shrink-0 shadow-xl relative group-hover:border-indigo-500 transition-colors">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="Video Thumb" />
                        <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white drop-shadow-lg">
                             <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                           </svg>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors">{video.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 max-w-sm">{video.script}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-400">
                      {seriesList.find(s => s.id === video.seriesId)?.topic || "Direct Lab Generation"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      video.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(video); }} className="p-3 bg-slate-800 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                       </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Enhanced Preview & Review Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-5xl p-8 lg:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row gap-12 overflow-hidden relative">
            
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-8 right-8 w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-20 border border-slate-700 shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Simulated Smartphone Player */}
            <div className="relative w-full max-w-[320px] aspect-[9/16] mx-auto lg:mx-0 flex-shrink-0 bg-black rounded-[3.5rem] border-[12px] border-slate-800 shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden">
               {isRegenerating ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-6 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Re-rendering assets...</p>
                 </div>
               ) : (
                 <div className="absolute inset-0 transition-all duration-1000">
                    <img 
                      src={selectedVideo.scenes?.[previewStep]?.imageUrl || selectedVideo.thumbnailUrl} 
                      className="w-full h-full object-cover opacity-90 transition-opacity duration-1000 scale-105"
                      alt="Active Scene"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                 </div>
               )}

               <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                     <span className="text-[9px] font-black text-white/60 tracking-[0.2em] uppercase">Vidra Player 1.0</span>
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                     </div>
                  </div>

                  <div className="space-y-6 mb-4">
                     {!isRegenerating && (
                       <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl animate-in slide-in-from-bottom-4 shadow-2xl">
                          <p className="text-white text-sm font-bold leading-relaxed italic">
                             "{selectedVideo.scenes?.[previewStep]?.text || selectedVideo.script}"
                          </p>
                       </div>
                     )}
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/20 shadow-lg"></div>
                        <div>
                           <p className="text-[11px] font-black text-white tracking-wide">@faceless_vidra</p>
                           <p className="text-[9px] text-slate-400 font-medium">AI Engineered Narrative</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Playback Line */}
               <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-[3500ms] linear shadow-[0_0_15px_#6366f1]" 
                    style={{ width: `${((previewStep + 1) / (selectedVideo.scenes?.length || 1)) * 100}%` }}
                  ></div>
               </div>
            </div>

            {/* Video Control Center */}
            <div className="flex-1 space-y-10 py-6">
               <div>
                  <h2 className="text-4xl font-black text-white mb-3 leading-tight tracking-tight">{selectedVideo.title}</h2>
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-black border border-indigo-500/30">
                        {selectedVideo.status}
                     </span>
                     <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Ready for deployment
                     </span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Review Narrative</h4>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 max-h-[220px] overflow-y-auto custom-scrollbar shadow-inner">
                    <p className="text-slate-300 text-base leading-relaxed">
                      {selectedVideo.script}
                    </p>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleRegenerate(selectedVideo)}
                      disabled={isRegenerating}
                      className="flex items-center justify-center gap-3 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all border border-slate-700 active:scale-95 disabled:opacity-50"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                       </svg>
                       Regenerate Logic
                    </button>
                    <button 
                      onClick={() => handleDownload(selectedVideo)}
                      className="flex items-center justify-center gap-3 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                       </svg>
                       Export Package
                    </button>
                  </div>
                  <button className="flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                     Post Instantly
                  </button>
               </div>

               <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Engine: Gemini 3.0 Flash</span>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ref: {selectedVideo.id}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQueue;
