
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VideoPlatform, VideoSeries, GeneratedVideo } from '../types';
import { GeminiService } from '../services/geminiService';

const SeriesManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vidra_series');
    if (saved) {
      setSeries(JSON.parse(saved));
    } else {
      // Seed initial series if empty
      const initial: VideoSeries[] = [{
        id: '1',
        topic: 'Space Exploration',
        tone: 'Informative & Mysterious',
        style: 'Cinematic',
        platform: VideoPlatform.TIKTOK,
        frequency: 'Daily',
        isActive: true,
        createdAt: '2023-10-01'
      }];
      setSeries(initial);
      localStorage.setItem('vidra_series', JSON.stringify(initial));
    }
  }, []);

  const [formData, setFormData] = useState({
    topic: '',
    tone: 'Viral & Engaging',
    platform: VideoPlatform.TIKTOK,
    frequency: 'Daily',
    style: 'Cinematic Photography'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    const newId = Math.random().toString(36).substr(2, 9);
    const newSeries: VideoSeries = {
      id: newId,
      topic: formData.topic,
      tone: formData.tone,
      platform: formData.platform,
      frequency: formData.frequency as any,
      style: formData.style,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedSeries = [...series, newSeries];
    setSeries(updatedSeries);
    localStorage.setItem('vidra_series', JSON.stringify(updatedSeries));
    setShowCreateModal(false);

    // Auto-generate first video for this series
    try {
      const bundle = await GeminiService.generateFullVideoBundle(formData.topic, formData.tone, formData.style);
      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        seriesId: newId,
        title: bundle.title,
        script: bundle.hook + " " + bundle.scenes.map((s: any) => s.text).join(" "),
        scenes: bundle.scenes,
        thumbnailUrl: bundle.thumbnailUrl,
        status: 'Ready',
        scheduledAt: new Date().toISOString(),
        platforms: [formData.platform]
      };

      const existingVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
      localStorage.setItem('vidra_videos', JSON.stringify([...existingVideos, newVideo]));
    } catch (err) {
      console.error("Auto-generation failed", err);
    } finally {
      setIsGenerating(false);
      setFormData({ topic: '', tone: 'Viral & Engaging', platform: VideoPlatform.TIKTOK, frequency: 'Daily', style: 'Cinematic Photography' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Series</h1>
          <p className="text-slate-400">Your automated faceless video engines</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Initializing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Series
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699-2.7c-.91.91-2.305.91-3.215 0a2.25 2.25 0 0 1 0-3.215 2.25 2.25 0 0 1 3.215 0Z" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{s.topic}</h3>
            <p className="text-slate-400 text-sm mb-6">{s.style} • {s.tone}</p>
            
            <div className="space-y-3 mb-6 bg-slate-800/30 p-4 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Platform</span>
                <span className="text-indigo-300 font-bold">{s.platform}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Frequency</span>
                <span className="text-slate-200 font-bold">{s.frequency}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Live Posts</span>
                <span className="text-emerald-500 font-black">ACTIVE</span>
              </div>
            </div>
            
            <Link 
              to="/queue" 
              className="block w-full text-center py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-sm font-bold rounded-xl transition-all border border-indigo-500/20"
            >
              View Generated Content
            </Link>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">Create Video Series</h2>
                <p className="text-slate-400 text-sm mt-1">Vidra will auto-generate videos based on these settings.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Video Niche / Topic</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Stoic Philosophy for Modern Life"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Art Style</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                    value={formData.style}
                    onChange={e => setFormData({...formData, style: e.target.value})}
                  >
                    <option>Cinematic Photography</option>
                    <option>Anime / Studio Ghibli</option>
                    <option>Cyberpunk / Neon</option>
                    <option>Oil Painting</option>
                    <option>Minimalist 3D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Frequency</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option>Daily</option>
                    <option>3x / week</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
              >
                {isGenerating ? "Initializing Engine..." : "Launch Series Automation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManagement;
