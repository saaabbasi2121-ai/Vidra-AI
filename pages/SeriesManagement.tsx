
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VideoPlatform, VideoSeries, GeneratedVideo, VoiceOption } from '../types';
import { GeminiService } from '../services/geminiService';
import { VoiceService, decodeBase64ToUint8, decodeAudioData } from '../services/voiceService';

const SeriesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [seriesToDelete, setSeriesToDelete] = useState<VideoSeries | null>(null);
  
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vidra_series');
    if (saved) {
      setSeries(JSON.parse(saved));
    } else {
      const initial: VideoSeries[] = [{
        id: '1',
        topic: 'Motivational Quotes',
        description: 'Powerful quotes about success and perseverance over cinematic landscapes.',
        tone: 'Inspirational',
        style: 'Cinematic Photography',
        voiceId: 'Charon',
        durationSeconds: 60,
        platform: VideoPlatform.TIKTOK,
        frequency: 'Daily',
        isActive: true,
        createdAt: '2023-10-01'
      }];
      setSeries(initial);
      localStorage.setItem('vidra_series', JSON.stringify(initial));
    }
    VoiceService.getVoices().then(setAvailableVoices);
  }, []);

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    tone: 'Viral & Engaging',
    platform: VideoPlatform.TIKTOK,
    frequency: 'Daily',
    style: 'Cinematic Photography',
    voiceId: 'Charon',
    durationSeconds: 60
  });

  const handlePreviewVoice = async () => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const base64Audio = await VoiceService.generateGeminiTTS("Voice engine synchronized.", formData.voiceId);
      if (base64Audio) {
        const uint8 = decodeBase64ToUint8(base64Audio);
        const buffer = await decodeAudioData(uint8, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPreviewingVoice(false);
        source.start();
      } else {
        setIsPreviewingVoice(false);
      }
    } catch (err) {
      console.error(err);
      setIsPreviewingVoice(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenProgress("Initializing Series Engine...");
    
    const newId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Step 1: Generate Full Content Bundle (Atomic generation)
      // Passing both durationSeconds and voiceId correctly now
      const bundle = await GeminiService.generateFullVideoBundle(
        formData.topic, 
        formData.description, 
        formData.tone, 
        formData.style, 
        formData.durationSeconds,
        formData.voiceId,
        (msg) => setGenProgress(msg)
      );
      
      setGenProgress("Finalizing Data Integration...");

      const newSeries: VideoSeries = {
        id: newId,
        topic: formData.topic,
        description: formData.description,
        tone: formData.tone,
        platform: formData.platform,
        frequency: formData.frequency as any,
        style: formData.style,
        voiceId: formData.voiceId,
        durationSeconds: formData.durationSeconds,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        seriesId: newId,
        title: bundle.title,
        script: bundle.hook + " " + bundle.scenes.map((s: any) => s.text).join(" "),
        scenes: bundle.scenes,
        thumbnailUrl: bundle.thumbnailUrl,
        status: 'Ready',
        scheduledAt: new Date().toISOString(),
        platforms: [formData.platform],
        voiceId: formData.voiceId,
        durationSeconds: formData.durationSeconds,
        source: 'AI'
      };

      // Step 2: Atomic Save to LocalStorage
      const existingSeries = JSON.parse(localStorage.getItem('vidra_series') || '[]');
      const updatedSeries = [...existingSeries, newSeries];
      localStorage.setItem('vidra_series', JSON.stringify(updatedSeries));
      setSeries(updatedSeries);

      const existingVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
      const updatedVideos = [newVideo, ...existingVideos];
      localStorage.setItem('vidra_videos', JSON.stringify(updatedVideos));

      setGenProgress("Success!");
      setTimeout(() => {
        setShowCreateModal(false);
        setIsGenerating(false);
        navigate('/queue');
      }, 1200);

    } catch (err) {
      console.error("Generation failed", err);
      alert("Pipeline Error: Failed to generate unique assets. Please try again.");
      setIsGenerating(false);
    }
  };

  const confirmDeleteSeries = () => {
    if (!seriesToDelete) return;
    const newSeriesList = series.filter(s => s.id !== seriesToDelete.id);
    setSeries(newSeriesList);
    localStorage.setItem('vidra_series', JSON.stringify(newSeriesList));

    const allVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
    const remainingVideos = allVideos.filter((v: GeneratedVideo) => v.seriesId !== seriesToDelete.id);
    localStorage.setItem('vidra_videos', JSON.stringify(remainingVideos));

    setSeriesToDelete(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Series Lab</h1>
          <p className="text-slate-400">Manage your automated niche engines</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          disabled={isGenerating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Series Engine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:border-indigo-500/50 transition-all group relative overflow-hidden flex flex-col h-full shadow-lg">
            <div className="absolute top-6 right-6 flex gap-2">
               <button 
                 onClick={() => setSeriesToDelete(s)}
                 className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6a1 1 0 0 1-1.18.92l-6.6-.34a1 1 0 0 1-.92-1.18l.34-6.6a1 1 0 0 1 1.18-.92l6.6.34a1 1 0 0 1 .92 1.18ZM9 7h6m-1 0a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2h4Z" /></svg>
               </button>
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 pr-12">{s.topic}</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">{s.style} • {s.tone}</p>
            
            <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-6">
               <p className="text-slate-400 text-xs leading-relaxed line-clamp-4 italic">
                  "{s.description || 'No additional genre context provided.'}"
               </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-xl">
                <span className="text-[10px] text-slate-500 font-black uppercase">Voice</span>
                <span className="text-indigo-400 text-xs font-bold truncate">
                  {availableVoices.find(v => v.id === s.voiceId)?.name || s.voiceId}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-xl">
                <span className="text-[10px] text-slate-500 font-black uppercase">Duration</span>
                <span className="text-slate-300 text-xs font-bold">{s.durationSeconds}s</span>
              </div>
            </div>
            
            <Link 
              to="/queue" 
              className="w-full text-center py-4 bg-white text-slate-900 text-sm font-black rounded-2xl transition-all hover:bg-slate-100 active:scale-[0.98]"
            >
              Review Pipeline
            </Link>
          </div>
        ))}
      </div>

      {seriesToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Delete Series?</h2>
              <p className="text-slate-400 text-sm mb-8">
                Deleting <span className="text-white font-bold">"{seriesToDelete.topic}"</span> will also remove all its generated episodes.
              </p>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmDeleteSeries} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all">Yes, Delete All Data</button>
                 <button onClick={() => setSeriesToDelete(null)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl p-10 lg:p-12 shadow-2xl relative overflow-hidden">
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95">
                 <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-12 h-12 bg-indigo-500 rounded-2xl animate-pulse"></div>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white mb-2">Architecting AI Bundle</h2>
                    <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">{genProgress}</p>
                 </div>
                 <p className="text-slate-500 text-xs max-w-xs mx-auto italic">"Synchronizing visual character anchors for absolute consistency. This will take ~45 seconds."</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-white leading-tight">Series Architect</h2>
                    <p className="text-slate-400 text-sm mt-1">Specify your niche details to prevent generic content.</p>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Engine Name</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Stoic Quotes"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 transition-colors font-bold"
                        value={formData.topic}
                        onChange={e => setFormData({...formData, topic: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Art Style</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold"
                        value={formData.style}
                        onChange={e => setFormData({...formData, style: e.target.value})}
                      >
                        <option>Cinematic Photography</option>
                        <option>Cyberpunk / Neon</option>
                        <option>Minimalist 3D</option>
                        <option>Anime / Studio Ghibli</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Niche Description (Deep Context)</label>
                    <textarea 
                      required
                      placeholder="Describe your subject in detail. E.g. A dark gritty series about ancient samurai wisdom. Character is a scarred samurai. NO SPACE THEMES."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white h-32 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Voice Engine</label>
                        <button type="button" onClick={handlePreviewVoice} className="text-[9px] text-indigo-400 font-black uppercase hover:text-white">Preview</button>
                      </div>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold"
                        value={formData.voiceId}
                        onChange={e => setFormData({...formData, voiceId: e.target.value})}
                      >
                        {availableVoices.map(voice => (
                          <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Video Length</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold"
                        value={formData.durationSeconds}
                        onChange={e => setFormData({...formData, durationSeconds: parseInt(e.target.value)})}
                      >
                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                        <option value={120}>120s</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
                  >
                    Launch Series Pipeline
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManagement;
