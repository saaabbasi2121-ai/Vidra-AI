import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoPlatform, VideoSeries } from '../types';

const SeriesManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [series, setSeries] = useState<VideoSeries[]>([
    {
      id: '1',
      topic: 'Space Exploration',
      tone: 'Informative & Mysterious',
      style: 'Cinematic',
      platform: VideoPlatform.TIKTOK,
      frequency: 'Daily',
      isActive: true,
      createdAt: '2023-10-01'
    }
  ]);

  const [formData, setFormData] = useState({
    topic: '',
    tone: 'Viral',
    platform: VideoPlatform.TIKTOK,
    frequency: 'Daily',
    style: 'Anime'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSeries: VideoSeries = {
      id: Math.random().toString(36).substr(2, 9),
      topic: formData.topic,
      tone: formData.tone,
      platform: formData.platform,
      frequency: formData.frequency as any,
      style: formData.style,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setSeries([...series, newSeries]);
    setShowCreateModal(false);
    setFormData({ topic: '', tone: 'Viral', platform: VideoPlatform.TIKTOK, frequency: 'Daily', style: 'Anime' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Series</h1>
          <p className="text-slate-400">Manage your recurring video campaigns</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Series
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-800 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{s.topic}</h3>
            <p className="text-slate-400 text-sm mb-6">{s.style} • {s.tone}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Platform</span>
                <span className="text-slate-200 font-medium">{s.platform}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Frequency</span>
                <span className="text-slate-200 font-medium">{s.frequency}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Active</span>
              </div>
            </div>
            
            <Link 
              to="/queue" 
              className="block w-full text-center py-2.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              Manage Queue
            </Link>
          </div>
        ))}

        <button 
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-slate-500 hover:text-indigo-400 min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="font-semibold">Create New Series</p>
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Setup Video Series</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Main Topic / Niche</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Daily Tech Facts, Scary Stories"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Visual Style</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    value={formData.style}
                    onChange={e => setFormData({...formData, style: e.target.value})}
                  >
                    <option>Cinematic</option>
                    <option>Anime</option>
                    <option>Digital Art</option>
                    <option>Vintage Film</option>
                    <option>Cyberpunk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option>Daily</option>
                    <option>3x / week</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Target Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {[VideoPlatform.TIKTOK, VideoPlatform.SHORTS, VideoPlatform.REELS].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, platform: p})}
                      className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all ${formData.platform === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
              >
                Create Automated Pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManagement;