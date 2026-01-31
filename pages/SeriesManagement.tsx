
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VideoPlatform, VideoSeries, GeneratedVideo, VoiceOption, NicheCategory } from '../types';
import { NICHE_CATEGORIES } from '../constants';
import { GeminiService } from '../services/geminiService';
import { VoiceService, decodeBase64ToUint8, decodeAudioData } from '../services/voiceService';

const SeriesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<VideoSeries[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [seriesToDelete, setSeriesToDelete] = useState<VideoSeries | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedNiche, setSelectedNiche] = useState<NicheCategory | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [voiceFilter, setVoiceFilter] = useState<'Male' | 'Female'>('Male');
  
  // Voice Interaction States
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vidra_series');
    if (saved) {
      setSeries(JSON.parse(saved));
    }
    VoiceService.getVoices().then(setAvailableVoices);
  }, []);

  const [formData, setFormData] = useState({
    voiceId: 'liam',
    durationSeconds: 60,
    platform: VideoPlatform.TIKTOK,
    frequency: 'Daily'
  });

  const filteredNiches = NICHE_CATEGORIES.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNiche = (niche: NicheCategory) => {
    setSelectedNiche(niche);
    const suggested = availableVoices.find(v => v.id === niche.suggestedVoiceId);
    setFormData(prev => ({ 
      ...prev, 
      voiceId: niche.suggestedVoiceId || (voiceFilter === 'Male' ? 'liam' : 'emma') 
    }));
    if (suggested) setVoiceFilter(suggested.gender);
    setShowConfigModal(true);
  };

  const handlePreviewVoice = async (vId: string) => {
    if (previewingVoiceId === vId) return;
    setPreviewingVoiceId(vId);
    
    // Stop current preview
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const voiceName = availableVoices.find(v => v.id === vId)?.name || "Partner";
      const previewText = `Hi, I'm ${voiceName}. I'll be narrating your ${selectedNiche?.name || 'content'}.`;
      
      const base64Audio = await VoiceService.generateGeminiTTS(previewText, vId);
      if (base64Audio) {
        const uint8 = decodeBase64ToUint8(base64Audio);
        const buffer = await decodeAudioData(uint8, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setPreviewingVoiceId(null);
        currentSourceRef.current = source;
        source.start();
      } else { 
        setPreviewingVoiceId(null); 
      }
    } catch (err) { 
      setPreviewingVoiceId(null); 
    }
  };

  const handleSelectVoice = (vId: string) => {
    setFormData(prev => ({ ...prev, voiceId: vId }));
    // Vibration feedback if available
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  // 2-Stage Interaction Handlers
  const onVoiceClick = (vId: string) => {
    if (formData.voiceId === vId) {
      // If already selected, maybe just preview again
      handlePreviewVoice(vId);
    } else {
      // First tap = Preview
      handlePreviewVoice(vId);
    }
  };

  const onVoiceDoubleClick = (vId: string) => {
    handleSelectVoice(vId);
  };

  const onVoicePointerDown = (vId: string) => {
    const timer = setTimeout(() => {
      handleSelectVoice(vId);
    }, 600); // 600ms for long press
    setLongPressTimer(timer);
  };

  const onVoicePointerUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNiche) return;
    
    setIsGenerating(true);
    setGenProgress("Verifying AI Connection...");
    
    // Safety check for API Key
    const test = await GeminiService.testConnection();
    if (!test.success) {
      alert(`API KEY ERROR: ${test.error}. Please ensure your API key is correctly configured in the environment.`);
      setIsGenerating(false);
      return;
    }

    setGenProgress("Architecting Your Series...");
    const newId = Math.random().toString(36).substr(2, 9);
    
    try {
      const bundle = await GeminiService.generateFullVideoBundle(
        selectedNiche.name, 
        selectedNiche.description, 
        selectedNiche.tone, 
        selectedNiche.style, 
        formData.durationSeconds,
        formData.voiceId,
        (msg) => setGenProgress(msg)
      );
      
      const newSeries: VideoSeries = {
        id: newId,
        topic: selectedNiche.name,
        description: selectedNiche.description,
        tone: selectedNiche.tone,
        platform: formData.platform,
        frequency: formData.frequency as any,
        style: selectedNiche.style,
        voiceId: formData.voiceId,
        durationSeconds: formData.durationSeconds,
        isActive: true,
        createdAt: new Date().toISOString(),
        nicheId: selectedNiche.id
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

      const existingSeries = JSON.parse(localStorage.getItem('vidra_series') || '[]');
      const updatedSeriesList = [...existingSeries, newSeries];
      localStorage.setItem('vidra_series', JSON.stringify(updatedSeriesList));
      setSeries(updatedSeriesList);
      
      const existingVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
      localStorage.setItem('vidra_videos', JSON.stringify([newVideo, ...existingVideos]));

      setGenProgress("Pipeline Active!");
      setTimeout(() => {
        setIsGenerating(false);
        navigate('/queue');
      }, 1000);
    } catch (err: any) {
      console.error("Generation Pipeline Error:", err);
      alert(`Generation Error: ${err.message || "Failed to orchestrate series. Check connection."}`);
      setIsGenerating(false);
    }
  };

  const confirmDeleteSeries = () => {
    if (!seriesToDelete) return;
    const newSeriesList = series.filter(s => s.id !== seriesToDelete.id);
    setSeries(newSeriesList);
    localStorage.setItem('vidra_series', JSON.stringify(newSeriesList));
    const allVideos = JSON.parse(localStorage.getItem('vidra_videos') || '[]');
    localStorage.setItem('vidra_videos', JSON.stringify(allVideos.filter(v => v.seriesId !== seriesToDelete.id)));
    setSeriesToDelete(null);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter">NICHE EXPLORER</h1>
          <p className="text-slate-400 font-medium">Select one of our 100+ high-viral niches to start automation.</p>
        </div>
        
        <div className="w-full md:w-96 relative group">
          <input 
            type="text" 
            placeholder="Search niches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-12 py-4 text-white font-bold focus:border-indigo-500 transition-all outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredNiches.map(niche => (
          <button 
            key={niche.id} 
            onClick={() => handleSelectNiche(niche)}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left hover:border-indigo-500 hover:bg-slate-800/50 transition-all group flex flex-col h-full shadow-lg active:scale-95"
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{niche.icon}</div>
            <h3 className="text-white font-black text-sm mb-2 line-clamp-1">{niche.name}</h3>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-3">{niche.group}</p>
            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3 italic opacity-60 group-hover:opacity-100 transition-opacity">"{niche.description}"</p>
          </button>
        ))}
      </div>

      {series.length > 0 && (
        <div className="pt-12 border-t border-slate-800 space-y-6">
           <h2 className="text-xl font-black text-white italic">ACTIVE PIPELINES</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {series.map(s => (
               <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="flex justify-between items-start mb-6 z-10">
                     <div>
                        <h3 className="text-2xl font-black text-white">{s.topic}</h3>
                        <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">{s.durationSeconds}s • {s.tone}</p>
                     </div>
                     <button onClick={() => setSeriesToDelete(s)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6a1 1 0 0 1-1.18.92l-6.6-.34a1 1 0 0 1-.92-1.18l.34-6.6a1 1 0 0 1 1.18-.92l6.6.34a1 1 0 0 1 .92 1.18ZM9 7h6m-1 0a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2h4Z" /></svg></button>
                  </div>
                  <Link to="/queue" className="w-full py-4 bg-white text-slate-900 text-center font-black rounded-2xl hover:bg-slate-200 transition-all z-10">Manage Queue</Link>
               </div>
             ))}
           </div>
        </div>
      )}

      {showConfigModal && selectedNiche && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl p-10 lg:p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                   <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                   <div>
                      <h2 className="text-3xl font-black text-white mb-2 italic tracking-tight uppercase">SYNDICATING ASSETS</h2>
                      <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">{genProgress}</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                       <div className="text-7xl">{selectedNiche.icon}</div>
                       <div>
                          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">{selectedNiche.name}</h2>
                          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{selectedNiche.group} Setup</p>
                       </div>
                    </div>
                    <button onClick={() => setShowConfigModal(false)} className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-3xl space-y-4 shadow-inner">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Pack</label>
                          <p className="text-slate-300 text-sm italic font-medium leading-relaxed">"{selectedNiche.description}"</p>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Timeline</label>
                          <div className="grid grid-cols-5 gap-2">
                             {[30, 60, 90, 120, 180].map(dur => (
                               <button 
                                 key={dur} 
                                 type="button"
                                 onClick={() => setFormData({...formData, durationSeconds: dur})}
                                 className={`py-4 rounded-xl font-black text-xs transition-all border ${formData.durationSeconds === dur ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                               >
                                 {dur}s
                               </button>
                             ))}
                          </div>
                       </div>

                       <button onClick={handleLaunch} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95">Launch Engine</button>
                    </div>

                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Narrator Gallery</label>
                          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                             <button type="button" onClick={() => setVoiceFilter('Male')} className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${voiceFilter === 'Male' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Male</button>
                             <button type="button" onClick={() => setVoiceFilter('Female')} className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${voiceFilter === 'Female' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Female</button>
                          </div>
                       </div>
                       
                       <p className="text-[10px] text-slate-500 italic px-1">Tap for Preview • Double Tap or Hold to Select</p>

                       <div className="grid grid-cols-2 gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {availableVoices.filter(v => v.gender === voiceFilter).map(voice => (
                            <div 
                              key={voice.id} 
                              onClick={() => onVoiceClick(voice.id)}
                              onDoubleClick={() => onVoiceDoubleClick(voice.id)}
                              onPointerDown={() => onVoicePointerDown(voice.id)}
                              onPointerUp={onVoicePointerUp}
                              onPointerLeave={onVoicePointerUp}
                              className={`p-4 rounded-3xl border transition-all text-left flex gap-4 items-center group relative cursor-pointer select-none ${formData.voiceId === voice.id ? 'bg-indigo-600/20 border-indigo-500 shadow-indigo-500/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                            >
                               <div className={`w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 border border-slate-700 overflow-hidden shadow-lg transition-transform ${previewingVoiceId === voice.id ? 'animate-pulse scale-110 border-indigo-500' : ''}`}>
                                  <img src={voice.avatarUrl} alt={voice.name} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className={`font-black text-sm ${formData.voiceId === voice.id ? 'text-white' : 'text-slate-400'}`}>{voice.name}</p>
                                  <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest italic">{voice.description?.split(' ')[0]}</p>
                               </div>
                               {formData.voiceId === voice.id && (
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-500 rounded-full p-1 shadow-lg animate-in zoom-in">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                                 </div>
                               )}
                               {previewingVoiceId === voice.id && (
                                 <div className="absolute left-0 bottom-0 w-full h-1 bg-indigo-500 overflow-hidden rounded-b-3xl">
                                    <div className="h-full bg-white/40 animate-[loading_2s_linear_infinite]" style={{ width: '40%' }}></div>
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {seriesToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 text-center shadow-2xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-white mb-8">Delete {seriesToDelete.topic}?</h2>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmDeleteSeries} className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl">Confirm Deletion</button>
                 <button onClick={() => setSeriesToDelete(null)} className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl">Cancel</button>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SeriesManagement;
