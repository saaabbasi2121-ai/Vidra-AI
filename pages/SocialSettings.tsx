
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

  const startGitHubHandshake = async () => {
    setIsLinking(VideoPlatform.GITHUB);
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
      
      // If we reach here, success!
      setAccounts(prev => prev.map(acc => 
        acc.platform === VideoPlatform.GITHUB 
          ? { ...acc, isConnected: true, username: 'authorized_user', lastSync: new Date().toISOString() }
          : acc
      ));
      setIsLinking(null);
    } catch (err) {
      console.error(err);
      // Keep isLinking active to show the error state in the terminal
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
          <p className="text-slate-400">Manage connections and publisher authorizations.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowTroubleshooter(true)} className="text-xs font-bold text-slate-400 hover:text-white border border-slate-800 px-4 py-2 rounded-xl transition-all">
             Diagnostic Guide
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {accounts.map((account) => (
          <div key={account.platform} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${account.isConnected ? 'bg-indigo-500/10 text-indigo-400 shadow-inner' : 'bg-slate-800 text-slate-500'}`}>
                  {getPlatformIcon(account.platform)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {account.platform}
                    {account.isConnected && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                  </h3>
                  {account.isConnected ? (
                    <span className="text-slate-400 text-sm">Authorized as <span className="text-white font-medium">{account.username}</span></span>
                  ) : (
                    <span className="text-slate-500 text-sm">Awaiting connection...</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {account.isConnected ? (
                  <button className="px-4 py-2 bg-slate-800 hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 text-xs font-bold rounded-xl transition-all border border-slate-700">
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => account.platform === VideoPlatform.GITHUB ? startGitHubHandshake() : null}
                    disabled={isLinking !== null}
                    className={`px-6 py-2.5 ${account.platform === VideoPlatform.GITHUB ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white'} text-sm font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                  >
                    {isLinking === account.platform ? 'Authenticating...' : `Connect ${account.platform}`}
                  </button>
                )}
              </div>
            </div>

            {/* Handshake Terminal for GitHub */}
            {isLinking === account.platform && account.platform === VideoPlatform.GITHUB && (
              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Handshake Terminal</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {handshakeSteps.map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={s.status === 'error' ? 'text-rose-400' : s.status === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                        {s.status === 'pending' ? '→' : s.status === 'success' ? '✓' : '✗'} {s.step}
                      </span>
                      {s.status === 'pending' && <span className="animate-pulse text-indigo-400">Executing...</span>}
                    </div>
                  ))}
                  {handshakeSteps.some(s => s.status === 'error') && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <p className="text-rose-400 font-bold mb-1 italic">HANDSHAKE_ERROR_0x442</p>
                      <p className="text-slate-400 mb-3">The "push back" from GitHub was rejected. This is often a CORS or Organization scope issue.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowTroubleshooter(true)} className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600">Troubleshoot</button>
                        <button onClick={() => setIsLinking(null)} className="px-3 py-1.5 text-slate-500 font-bold">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Troubleshooting Modal */}
      {showTroubleshooter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-white italic">HANDSHAKE DEBUG</h2>
                <p className="text-slate-400 font-medium">Why the GitHub "Push Back" is failing</p>
              </div>
              <button onClick={() => setShowTroubleshooter(false)} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                 <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                   Critical Checklist
                 </h4>
                 <ul className="space-y-4 text-sm">
                   <li className="flex gap-3 text-slate-300">
                     <span className="text-emerald-500 font-bold">01</span>
                     <span><strong>Org Access:</strong> Ensure Vidra has been explicitly granted access to your specific GitHub Organization (Settings > Member Privileges).</span>
                   </li>
                   <li className="flex gap-3 text-slate-300">
                     <span className="text-emerald-500 font-bold">02</span>
                     <span><strong>Redirect URIs:</strong> Ensure your local dev URL or production domain is whitelisted in the GitHub App "Callback URL" field.</span>
                   </li>
                   <li className="flex gap-3 text-slate-300">
                     <span className="text-emerald-500 font-bold">03</span>
                     <span><strong>Webhook Handshake:</strong> If using webhooks, GitHub must reach your server. "Something went wrong" occurs when the webhook returns anything other than 200 OK.</span>
                   </li>
                 </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setShowTokenInput(true)}
                  className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 text-left hover:border-indigo-500 transition-all group"
                 >
                   <p className="text-indigo-400 font-black mb-1">Method A</p>
                   <p className="text-xs text-slate-400">Use Personal Access Token (PAT) for 100% reliability.</p>
                 </button>
                 <button 
                  onClick={forceConnect}
                  className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 text-left hover:border-emerald-500 transition-all group"
                 >
                   <p className="text-emerald-400 font-black mb-1">Method B</p>
                   <p className="text-xs text-slate-400">Force Mock Connection (Proceed with Demo Mode).</p>
                 </button>
              </div>
            </div>

            {showTokenInput && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <input 
                  type="password" 
                  placeholder="Paste your ghp_ Token here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                />
                <button onClick={forceConnect} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20">Verify & Link GitHub</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSettings;
