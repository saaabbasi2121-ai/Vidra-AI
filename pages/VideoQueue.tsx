
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedVideo, VideoPlatform, VideoSeries, VoiceOption } from '../types';
import { ICONS } from '../constants';
import { ExportService } from '../services/exportService';
import { GeminiService } from '../services/geminiService';
import { VoiceService } from '../services/voiceService';

const VideoQueue: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [previewStep, setPreviewStep] = useState(0);
  const [queue, setQueue] = useState<GeneratedVideo[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [seriesList, setSeriesList] = useState<VideoSeries[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  
  // New State for Uploads
  const [activeTab, setActiveTab] = useState<'AI' | 'Manual'>('AI');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedVideos = localStorage.getItem('vidra_videos');
    const savedSeries = localStorage.getItem('vidra_series');
    
    if (savedVideos) setQueue(JSON.parse(savedVideos));
    if (savedSeries) setSeriesList(JSON.parse(savedSeries));
    
    VoiceService.getVoices().then(setAvailableVoices);
  }, []);

  const saveQueue = (newQueue: GeneratedVideo[]) => {
    setQueue(newQueue);
    localStorage.setItem('vidra_videos', JSON.stringify(newQueue));
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAll(false);
  };

  const playSceneAudio = async (video: GeneratedVideo, index: number, chainPlay: boolean = false) => {
    if (video.source === 'Manual') return; // Manual videos don't have scenes/TTS usually

    const scene = video.scenes[index];
    if (!scene) return;

    setPreviewStep(index);
    setIsAudioLoading(true);

    try {
      let audioUrl = scene.audioUrl;
      
      if (!audioUrl && video.voiceId) {
        audioUrl = await VoiceService.generateAudio(scene.text, video.voiceId) || undefined;
        if (audioUrl) {
          const updatedScenes = [...video.scenes];
          updatedScenes[index] = { ...scene, audioUrl };
          const updatedVideo = { ...video, scenes: updatedScenes };
          const newQueue = queue.map(v => v.id === video.id ? updatedVideo : v);
          saveQueue(newQueue);
          setSelectedVideo(updatedVideo);
        }
      }

      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          if (chainPlay && index < video.scenes.length - 1) {
            playSceneAudio(video, index + 1, true);
          } else {
            setIsPlayingAll(false);
          }
        };
      } else {
        setTimeout(() => {
          if (chainPlay && index < video.scenes.length - 1) {
            playSceneAudio(video, index + 1, true);
          } else {
            setIsPlayingAll(false);
          }
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!selectedVideo || selectedVideo.source === 'Manual') return;
    stopAudio();
    setIsPlayingAll(true);
    playSceneAudio(selectedVideo, 0, true);
  };

  const handleSelectScene = (index: number) => {
    if (!selectedVideo || selectedVideo.source === 'Manual') return;
    stopAudio();
    playSceneAudio(selectedVideo, index, false);
  };

  const handleRegenerate = async (video: GeneratedVideo) => {
    if (video.source === 'Manual') return;
    stopAudio();
    setIsRegenerating(true);
    try {
      const series = seriesList.find(s => s.id === video.seriesId);
      if (!series) throw new Error("Series config lost.");

      const bundle = await GeminiService.generateFullVideoBundle(
        series.topic, 
        series.description, 
        series.tone, 
        series.style, 
        series.durationSeconds
      );
      
      const updatedVideo: GeneratedVideo = {
        ...video,
        title: bundle.title,
        script: bundle.hook + " " + bundle.scenes.map((s: any) => s.text).join(" "),
        scenes: bundle.scenes,
        thumbnailUrl: bundle.thumbnailUrl,
        status: 'Ready',
        durationSeconds: series.durationSeconds,
        voiceId: series.voiceId
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

  // Fix: Explicitly cast e.currentTarget to HTMLFormElement for correct access to elements and FormData
  const handleManualUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const title = formData.get('title') as string;
    const script = formData.get('script') as string;
    const file = (formElement.elements.namedItem('videoFile') as HTMLInputElement).files?.[0];

    if (!file) return;

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const videoUrl = URL.createObjectURL(file);
      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        script,
        scenes: [], // Manual videos don't use AI scenes in this workflow
        thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800',
        videoUrl,
        status: 'Ready',
        scheduledAt: new Date().toISOString(),
        platforms: [VideoPlatform.TIKTOK, VideoPlatform.SHORTS, VideoPlatform.REELS],
        source: 'Manual'
      };

      const newQueue = [newVideo, ...queue];
      saveQueue(newQueue);
      setIsUploading(false);
      setShowUploadModal(false);
      setActiveTab('Manual');
    }, 2000);
  };

  const filteredQueue = queue.filter(v => 
    activeTab === 'AI' ? (v.source === 'AI' || !v.source) : v.source === 'Manual'
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Vidra Video Hub</h1>
          <p className="text-slate-400">Preview, edit, and post your unique automated content.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Video
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('AI')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'AI' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
        >
          AI Pipelines
        </button>
        <button 
          onClick={() => setActiveTab('Manual')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'Manual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
        >
          Direct Vault
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-8 py-5">Content Preview</th>
                <th className="px-8 py-5">Series Context</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">
                    {activeTab === 'AI' ? 'No AI videos generated yet.' : 'Your manual vault is empty.'}
                  </td>
                </tr>
              ) : filteredQueue.map((video) => (
                <tr key={video.id} className="hover:bg-indigo-500/5 transition-all group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 aspect-[9/16] bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 flex-shrink-0 shadow-xl relative group-hover:border-indigo-500 transition-colors">
                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="Video Thumb" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors">{video.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 max-w-sm">{video.script}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-400">
                        {video.source === 'Manual' ? 'Manual Upload' : (seriesList.find(s => s.id === video.seriesId)?.topic || 'Direct Lab')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        {video.durationSeconds || 'Auto'}s • {video.voiceId ? (availableVoices.find(v => v.id === video.voiceId)?.name) : 'Native Audio'}
                      </p>
                    </div>
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
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-xl p-10 lg:p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
             
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white">Upload Manual Content</h2>
                <button onClick={() => setShowUploadModal(false)} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
             </div>

             <form onSubmit={handleManualUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Video Title</label>
                  <input name="title" required type="text" placeholder="Viral Hook Title..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Description / Script</label>
                  <textarea name="script" placeholder="Enter video caption or script..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner h-24 resize-none" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Select MP4/MOV File</label>
                   <div className="relative group">
                      <input 
                        type="file" 
                        name="videoFile"
                        accept="video/*"
                        required
                        ref={fileInputRef}
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-emerald-500/50 transition-all bg-slate-950/50"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-600 group-hover:text-emerald-500">
                           <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                         </svg>
                         <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Click to choose video file</span>
                      </button>
                   </div>
                </div>

                <button 
                  disabled={isUploading}
                  className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-emerald-600/30 active:scale-[0.98] disabled:opacity-50"
                >
                  {isUploading ? "Transcoding Assets..." : "Add to Vault"}
                </button>
             </form>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-6xl p-8 lg:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row gap-12 overflow-hidden relative">
            <button onClick={() => { stopAudio(); setSelectedVideo(null); }} className="absolute top-8 right-8 w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-20 border border-slate-700 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative w-full max-w-[320px] aspect-[9/16] mx-auto lg:mx-0 flex-shrink-0 bg-black rounded-[3.5rem] border-[12px] border-slate-800 shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden">
               {isRegenerating ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-6 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Re-applying Genre Logic...</p>
                 </div>
               ) : (
                 <div className="absolute inset-0 transition-all duration-1000">
                    {selectedVideo.videoUrl ? (
                      <video 
                        src={selectedVideo.videoUrl} 
                        controls 
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                      />
                    ) : (
                      <img 
                        src={selectedVideo.scenes?.[previewStep]?.imageUrl || selectedVideo.thumbnailUrl} 
                        className={`w-full h-full object-cover transition-all duration-1000 ${isAudioLoading ? 'opacity-30 blur-sm' : 'opacity-90 scale-105'}`}
                        alt="Active Scene"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none"></div>
                 </div>
               )}
               {!selectedVideo.videoUrl && (
                 <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                       <span className="text-[9px] font-black text-white/60 tracking-[0.2em] uppercase">
                         {selectedVideo.durationSeconds || 60}s • {availableVoices.find(v => v.id === selectedVideo.voiceId)?.name || 'Narrator'}
                       </span>
                    </div>
                    <div className="space-y-6 mb-4">
                       {!isRegenerating && (
                         <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl animate-in slide-in-from-bottom-4 shadow-2xl">
                            <p className="text-white text-sm font-bold leading-relaxed italic">"{selectedVideo.scenes?.[previewStep]?.text}"</p>
                         </div>
                       )}
                    </div>
                 </div>
               )}
               {!selectedVideo.videoUrl && (
                 <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800">
                    <div className="h-full bg-indigo-500 transition-all duration-[3500ms] linear shadow-[0_0_15px_#6366f1] opacity-100" style={{ width: `${((previewStep + 1) / (selectedVideo.scenes?.length || 1)) * 100}%` }}></div>
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-8 py-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-3 leading-tight tracking-tight">{selectedVideo.title}</h2>
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 ${selectedVideo.source === 'Manual' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-indigo-600/20 text-indigo-400'} rounded-lg text-xs font-black border border-current opacity-60`}>
                         {selectedVideo.source === 'Manual' ? 'Direct Import' : 'AI Rendered'}
                       </span>
                       <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{selectedVideo.durationSeconds || 'Auto'} Duration</span>
                    </div>
                  </div>
                  {!selectedVideo.videoUrl && (
                    <button onClick={handlePlayAll} disabled={isPlayingAll || isAudioLoading} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all group">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                      Play All
                    </button>
                  )}
               </div>

               {selectedVideo.source === 'Manual' ? (
                 <div className="bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8">
                   <h4 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Original Script / Caption</h4>
                   <p className="text-slate-300 leading-relaxed italic">"{selectedVideo.script}"</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <h4 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Storyboard / Scenes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedVideo.scenes.map((scene, i) => (
                        <button key={i} onClick={() => handleSelectScene(i)} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all text-left group ${previewStep === i ? 'bg-indigo-500/10 border-indigo-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}>
                          <div className="w-12 h-16 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800"><img src={scene.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                          <div className="flex-1 overflow-hidden">
                             <p className={`text-xs font-bold leading-tight line-clamp-2 transition-colors ${previewStep === i ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{scene.text}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                 </div>
               )}

               <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleRegenerate(selectedVideo)} 
                      disabled={isRegenerating || selectedVideo.source === 'Manual'} 
                      className={`flex items-center justify-center gap-3 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all border border-slate-700 active:scale-95 disabled:opacity-50 ${selectedVideo.source === 'Manual' ? 'cursor-not-allowed grayscale' : ''}`}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                       {selectedVideo.source === 'Manual' ? 'Native Content' : 'Apply Unique Context'}
                    </button>
                    <button onClick={() => handleDownload(selectedVideo)} className="flex items-center justify-center gap-3 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-2xl active:scale-95">
                       Download Bundle
                    </button>
                  </div>
                  <button className={`flex items-center justify-center gap-3 py-5 ${selectedVideo.source === 'Manual' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-black rounded-2xl transition-all shadow-xl active:scale-95`}>
                    {selectedVideo.source === 'Manual' ? 'Post to Socials' : 'Auto-Post Series'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQueue;
