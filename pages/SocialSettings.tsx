
import React, { useState, useEffect } from 'react';
import { VideoPlatform, SocialAccount } from '../types';
import { ICONS } from '../constants';
import { GitHubService } from '../services/githubService';

const SocialSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: VideoPlatform.TIKTOK, username: '@tech_whisperer', isConnected: true, lastSync: '2023-10-12T14:30:00Z' },
    { platform: VideoPlatform.SHORTS, username: 'Tech Whisperer AI', isConnected: true, lastSync: '2023-10-13T09:15:00Z' },
    { platform: VideoPlatform.REELS, username: 'tech.whisperer.official', isConnected: false },
    { platform: VideoPlatform.GITHUB, username: 'dev-whisperer', isConnected: false },
  ]);

  const [handshakeSteps, setHandshakeSteps] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState<VideoPlatform | null>(null);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const startGitHubHandshake = async () => {
    setIsLinking(VideoPlatform.GITHUB);
    setIsSuccess(false);
    setHandshakeSteps([]);
    
    const generator = GitHubService.connectHandshake();
    
    try {
      for await (const update of generator) {
        setHandshakeSteps(prev => {
          const existing = prev.findIndex(s => s.step === update.step);
          if (existing > -1) {
            const copy = [...prev];
            copy[existing] = update;
            return copy;
          }
          return [...prev, update];
        });
        if (update.status === 'error') throw new Error(update.message);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setAccounts(prev => prev.map(acc => 
          acc.platform === VideoPlatform.GITHUB 
            ? { ...acc, isConnected: true, username: 'authorized_user', lastSync: new Date().toISOString() }
            : acc
        ));
        setIsLinking(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const forceConnect = () => {
    setAccounts(prev => prev.map(acc => 
      acc.platform === VideoPlatform.GITHUB 
        ? { ...acc, isConnected: true, username: 'vidra_dev_override', lastSync: new Date().toISOString() }
        : acc
    ));
    setIsLinking(null);
    setShowTroubleshooter(false);
  };

  const getPlatformIcon = (platform: VideoPlatform) => {
    switch (platform) {
      case VideoPlatform.TIKTOK: return <ICONS.TikTok className="w-8 h-8" />;
      case VideoPlatform.SHORTS: return <ICONS.YouTubeShorts className="w-8 h-8" />;
      case VideoPlatform.REELS: return <ICONS.InstagramReels className="w-8 h-8" />;
      case VideoPlatform.GITHUB: return <ICONS.GitHub className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Integrations</h1>
          <p className="text-slate-400">Connect your Vidra publisher engine to your social channels.</p>
        </div>
        <div className="flex gap-4">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Environment</span>
             <span className="text-xs text-emerald-400 font-medium">Vercel Production</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {accounts.map((account) => (
          <div key={account.platform} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${account.isConnected ? 'bg-indigo-500/10 text-indigo-400 shadow-inner' : 'bg-slate-800 text-slate-500'}`}>
                  {getPlatformIcon(account.platform)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {account.platform}
                    {account.isConnected && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                  </h3>
                  {account.isConnected ? (
                    <span className="text-slate-400 text-sm font-medium">Linked as <span className="text-indigo-400">{account.username}</span></span>
                  ) : (
                    <span className="text-slate-500 text-sm italic">Connection pending...</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {account.isConnected ? (
                  <button className="px-4 py-2 bg-slate-800 hover:bg-rose-900/20 text-slate-500 hover:text-rose-400 text-xs font-bold rounded-xl transition-all border border-slate-700">
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => account.platform === VideoPlatform.GITHUB ? startGitHubHandshake() : null}
                    disabled={isLinking !== null}
                    className={`px-6 py-2.5 ${account.platform === VideoPlatform.GITHUB ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'} text-sm font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                  >
                    {isLinking === account.platform ? 'Authorizing...' : `Connect ${account.platform}`}
                  </button>
                )}
              </div>
            </div>

            {isLinking === account.platform && account.platform === VideoPlatform.GITHUB && (
              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Handshake Terminal</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">v1.0-stable</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {handshakeSteps.map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={s.status === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                        {s.status === 'pending' ? <span className="text-indigo-500">→</span> : '✓'} {s.step}
                      </span>
                      {s.status === 'pending' && (
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isSuccess && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95">
                      <p className="text-emerald-400 font-bold flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                           <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                         </svg>
                         SUCCESS_HANDSHAKE_COMPLETE
                      </p>
                      <p className="text-slate-400 mt-1 text-[11px]">Vidra is now authorized to push automated video bundles to your GitHub repositories.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-8 flex items-center justify-between">
         <div className="max-w-lg">
            <h3 className="text-xl font-bold text-white mb-2">Vercel Deployment Setup</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              To make your video generation live, ensure you add your <strong>API_KEY</strong> to the environment variables in your Vercel Dashboard settings.
            </p>
         </div>
         <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
           Go to Vercel Settings &rarr;
         </button>
      </div>

      {showTroubleshooter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white italic">FORCE OVERRIDE</h2>
              <button onClick={() => setShowTroubleshooter(false)} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button onClick={forceConnect} className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30">
               Force Connection Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSettings;
