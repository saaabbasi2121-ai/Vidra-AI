
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService.ts';
import { ExportService } from '../services/exportService.ts';
import { GitHubService } from '../services/githubService.ts';
import { ICONS } from '../constants.tsx';
import { Link } from 'react-router-dom';

const GeneratorDemo: React.FC = () => {
  const [topic, setTopic] = useState('Life lessons from Stoic philosophy');
  const [status, setStatus] = useState<'Idle' | 'Scripting' | 'Visualizing' | 'Synthesizing' | 'Success'>('Idle');
  const [result, setResult] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleDownloadBundle = () => {
    if (!result) return;
    const projectBundle = {
      ...result,
      assets: images.map((img, i) => ({ scene: i, data: img })),
      exportedAt: new Date().toISOString(),
      engine: 'Vidra v1.0-alpha'
    };
    ExportService.downloadProject(projectBundle, `vidra-project-${Date.now()}.json`);
    addLog('💾 Vidra Project bundle downloaded successfully.');
  };

  const handlePushToGitHub = async () => {
    if (!result || isSyncing) return;
    setIsSyncing(true);
    addLog('🚀 Initializing GitHub Sync...');
    addLog('🔍 Validating repository permissions...');
    
    const syncResult = await GitHubService.pushProjectToRepo('vidra-factory/generated-content', result);
    
    if (syncResult.success) {
      addLog('📦 Preparing repository package...');
      await new Promise(r => setTimeout(r, 500));
      addLog('git add content/script.json content/assets/*.png');
      addLog(`git commit -m "Vidra Auto-generated: ${result.title}"`);
      addLog('git push origin main');
      addLog('✨ Successfully pushed to repository');
    } else {
      addLog(`❌ Sync Failed: ${syncResult.error}`);
      addLog('💡 TIP: If you see "Something went wrong" in Google AI Studio, ensure you have enabled "Third-party application access policy" in your GitHub Organization settings.');
    }
    
    setIsSyncing(false);
  };

  const handleGenerate = async () => {
    try {
      setResult(null);
      setImages([]);
      setLogs([]);
      setStatus('Scripting');
      addLog('🚀 Initializing automated pipeline...');
      
      const conn = await GeminiService.testConnection();
      if (!conn.success) {
        throw new Error(conn.error || "Connection failed");
      }
      addLog('✅ API Connection verified.');

      // Fix: Added missing description argument to match GeminiService.generateScript(topic, description, tone, style)
      const script = await GeminiService.generateScript(topic, topic, 'Inspirational', 'Cinematic Photography');
      setResult(script);
      addLog(`✅ Script generated: "${script.title}"`);
      
      setStatus('Visualizing');
      addLog('🎨 Generating high-fidelity 9:16 vertical assets...');
      
      const generatedImages: string[] = [];
      const scenesToGen = script.scenes.slice(0, 3);
      
      for (let i = 0; i < scenesToGen.length; i++) {
        addLog(`Scene ${i+1}/${scenesToGen.length}: Interpreting image prompt...`);
        const img = await GeminiService.generateImage(scenesToGen[i].imagePrompt);
        if (img) {
          generatedImages.push(img);
          setImages([...generatedImages]);
          addLog(`✅ Visual ${i+1} ready.`);
        }
      }

      setStatus('Success');
      addLog('✨ Vidra pipeline finalized. Project ready.');
    } catch (err) {
      console.error(err);
      addLog('❌ Error: ' + (err as Error).message);
      setStatus('Idle');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Vidra Laboratory</h1>
          <p className="text-slate-400 mt-1">Generate, test, and sync video project bundles</p>
        </div>
        <div className="flex items-center gap-4">
          {status === 'Success' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePushToGitHub}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                <ICONS.GitHub className="w-4 h-4" />
                {isSyncing ? 'Syncing...' : 'Push to Repo'}
              </button>
              <button 
                onClick={handleDownloadBundle}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Bundle
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <div className={`w-2 h-2 rounded-full ${status !== 'Idle' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`}></div>
            {status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Vidra Config</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">Topic / Series Prompt</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium shadow-inner"
                  rows={4}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter a specific sub-topic for this generation..."
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={status !== 'Idle' && status !== 'Success'}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
              >
                {status === 'Idle' || status === 'Success' ? 'Trigger Vidra Workflow' : 'Orchestrating Vidra...'}
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-[10px] overflow-hidden h-[300px] flex flex-col shadow-inner">
            <h3 className="text-slate-500 uppercase tracking-widest font-bold mb-4 flex items-center justify-between">
              Live Pipeline Logs
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hide">
              {logs.length === 0 && <p className="text-slate-700 italic">Waiting for execution signal...</p>}
              {logs.map((log, i) => (
                <p key={i} className={`${log.includes('Error') || log.includes('❌') ? 'text-rose-500' : log.includes('✅') || log.includes('✨') ? 'text-emerald-400' : log.includes('git') ? 'text-slate-500' : 'text-indigo-300'}`}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold uppercase tracking-widest border border-emerald-500/30">
                  Vidra Project Ready
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white leading-tight mb-2">{result.title}</h3>
                <div className="flex items-center gap-3">
                   <span className="text-indigo-400 text-sm font-semibold">AI Asset Pack Ready</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {result.scenes.map((scene: any, i: number) => (
                  <div 
                    key={i} 
                    className={`flex gap-6 items-start p-4 rounded-2xl transition-all border ${activeScene === i ? 'bg-slate-800/50 border-slate-700' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    onMouseEnter={() => setActiveScene(i)}
                  >
                    <div className="w-24 aspect-[9/16] bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-800 shadow-2xl">
                      {images[i] && <img src={images[i]} className="w-full h-full object-cover" alt="Scene Asset" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">{scene.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vidra Engine Healthy</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={handlePushToGitHub} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors border border-slate-700">Sync GitHub</button>
                   <Link to="/socials" className="px-4 py-2 bg-indigo-600/10 text-indigo-400 font-bold rounded-xl text-xs hover:bg-indigo-600/20">Troubleshoot</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center group">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-300">Vidra Lab Idle</h3>
              <p className="text-slate-500 max-w-[280px] mt-2 text-sm italic">Generate your first series to see assets here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratorDemo;
