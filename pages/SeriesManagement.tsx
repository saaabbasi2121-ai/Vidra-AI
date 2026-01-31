
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { VideoPlatform, VideoSeries, GeneratedVideo, VoiceOption } from '../types';
import { GeminiService } from '../services/geminiService';
import { VoiceService } from '../services/voiceService';

const SeriesManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vidra_series');
    if (saved) {
      setSeries(JSON.parse(saved));
    } else {
      const initial: VideoSeries[] = [{
        id: '1',
        topic: 'Space Exploration',
        description: 'Documentary style exploration of the cosmos focusing on mysterious anomalies and high-quality space photography.',
        tone: 'Informative & Mysterious',
        style: 'Cinematic',
        voiceId: '21m00Tcm4lvcESmeDXWV',
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
    voiceId: '21m00Tcm4lvcESmeDXWV',
    durationSeconds: 60
  });

  const handlePreviewVoice = async () => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    
    const phrase = "Hi Welcome aboard to Vidra for your anonymous journey to success while you sleep";
    
    try {
      const audioUrl = await VoiceService.generateAudio(phrase, formData.voiceId);
      if (audioUrl) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPreviewingVoice(false);
      } else {
        // Fallback alert for no API key
        alert("Playing fallback preview for selected voice...");
        setTimeout(() => setIsPreviewingVoice(false), 2000);
      }
    } catch (err) {
      console.error(err);
      setIsPreviewingVoice(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    const newId = Math.random().toString(36).substr(2, 9);
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

    const updatedSeries = [...series, newSeries];
    setSeries(updatedSeries);
    localStorage.setItem('vidra_series', JSON.stringify(updatedSeries));
    setShowCreateModal(false);

    try {
      const bundle = await GeminiService.generateFullVideoBundle(
        formData.topic, 
        formData.description, 
        formData.tone, 
        formData.style, 
        formData.durationSeconds
      );
      
      // Fix: Added missing 'source' property to GeneratedVideo
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

      const existingVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
      localStorage.setItem('vidra_videos', JSON.stringify([...existingVideos, newVideo]));
    } catch (err) {
      console.error("Auto-generation failed", err);
    } finally {
      setIsGenerating(false);
      setFormData({ 
        topic: '', 
        description: '',
        tone: 'Viral & Engaging', 
        platform: VideoPlatform.TIKTOK, 
        frequency: 'Daily', 
        style: 'Cinematic Photography',
        voiceId: '21m00Tcm4lvcESmeDXWV',
        durationSeconds: 60
      });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Content Series</h1>
          <p className="text-slate-400">Your unique automated faceless video engines</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          disabled={isGenerating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          )}
          {isGenerating ? 'Engaging AI...' : 'New Series Engine'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:border-indigo-500/50 transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{s.topic}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">{s.style} • {s.tone}</p>
            
            <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-6">
               <p className="text-slate-400 text-xs leading-relaxed line-clamp-4 italic">
                  "{s.description || 'No additional genre context provided.'}"
               </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-xl">
                <span className="text-[10px] text-slate-500 font-black uppercase">Voice</span>
                <span className="text-indigo-400 text-xs font-bold truncate max-w-[140px]">
                  {availableVoices.find(v => v.id === s.voiceId)?.name || 'Default Narrator'}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-xl">
                <span className="text-[10px] text-slate-500 font-black uppercase">Schedule</span>
                <span className="text-slate-300 text-xs font-bold">{s.frequency} @ {s.durationSeconds}s</span>
              </div>
            </div>
            
            <Link 
              to="/queue" 
              className="w-full text-center py-4 bg-white text-slate-900 text-sm font-black rounded-2xl transition-all hover:bg-slate-100 active:scale-[0.98]"
            >
              Review Content
            </Link>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl p-10 lg:p-12 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-black text-white leading-tight">Series Architect</h2>
                <p className="text-slate-400 text-sm mt-1">Deep contextual parameters for unique AI narrative output.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Engine Niche Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g.Stoic Wisdom"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-bold"
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Visual Art Direction</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-bold"
                    value={formData.style}
                    onChange={e => setFormData({...formData, style: e.target.value})}
                  >
                    <option>Cinematic Photography</option>
                    <option>Anime / Studio Ghibli</option>
                    <option>Cyberpunk / Neon</option>
                    <option>Minimalist 3D</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Series Genre Context (Better Uniqueness)</label>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase">Up to 50 lines description</span>
                </div>
                <textarea 
                  required
                  placeholder="Describe your series in detail. E.g. Focus on dark stoic quotes with moody lighting, avoid cliches, use specific historical examples from 300BC..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-medium h-32 resize-none custom-scrollbar"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Voice Engine</label>
                    <button 
                      type="button" 
                      onClick={handlePreviewVoice}
                      className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-lg font-black uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1"
                    >
                      {isPreviewingVoice ? 'Speaking...' : 'Preview Voice'}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10 3a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z" /></svg>
                    </button>
                  </div>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-bold"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-bold"
                    value={formData.durationSeconds}
                    onChange={e => setFormData({...formData, durationSeconds: parseInt(e.target.value)})}
                  >
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={90}>90 Seconds</option>
                    <option value={120}>120 Seconds</option>
                    <option value={180}>180 Seconds</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? "Assembling Content..." : "Launch Series Automation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManagement;
