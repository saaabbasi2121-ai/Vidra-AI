
import React from 'react';
import { Link } from 'react-router-dom';
import { SubscriptionPlan, PLAN_CONFIGS } from '../types';

const StatCard = ({ title, value, change, isPositive, subtext }: { title: string; value: string; change?: string; isPositive?: boolean; subtext?: string }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <div className="flex items-end justify-between mt-2">
      <div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
      {change && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {isPositive ? '+' : '-'}{change}
        </span>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const currentPlan = SubscriptionPlan.STARTER;
  const limits = PLAN_CONFIGS[currentPlan];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Channel Overview</h1>
          <p className="text-slate-400">Manage your Vidra automation hub</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
             <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{currentPlan} Plan</span>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            Create New Series
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Weekly Credits" value="2 / 3" subtext="Refreshes in 2 days" />
        <StatCard title="Total Views" value="842.5K" change="24%" isPositive={true} />
        <StatCard title="Followers Gained" value="4.2K" change="8%" isPositive={true} />
        <StatCard title="Avg. Watch Time" value="14.2s" change="2%" isPositive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">Audience Growth</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 60, 45, 90, 65, 80, 55, 70, 95, 50, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-lg relative group transition-all hover:bg-indigo-500/40" style={{ height: `${h}%` }}>
                   <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md transition-opacity whitespace-nowrap z-10">
                    {h * 100} views
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500 font-medium">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Live Series Status</h3>
              <div className="text-xs text-slate-500">
                Using {1} of {limits.maxSeries} series slots
              </div>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                { name: "Mind-Blowing Space Facts", platform: "TikTok", frequency: "Daily", status: "Active" },
                { name: "Scary Horror Stories", platform: "YT Shorts", frequency: "3x/week", status: "Active" },
              ].map((series, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{series.name}</p>
                      <p className="text-xs text-slate-500">{series.platform} • {series.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: '70%' }}></div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${series.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                      {series.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Videos / week</span>
                <span className="text-white font-bold">{limits.videosPerWeek}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Max Active Series</span>
                <span className="text-white font-bold">{limits.maxSeries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Multi-Platform</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                   Enabled
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                     <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                   </svg>
                </span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                "Daily and Pro plans unlock 1-click posting to all platforms and removal of the 'Made with Vidra' watermark."
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699-2.7c-.91.91-2.305.91-3.215 0a2.25 2.25 0 0 1 0-3.215 2.25 2.25 0 0 1 3.215 0Z" />
               </svg>
            </div>
            <h4 className="text-lg font-bold mb-2">Automate Like a Pro</h4>
            <p className="text-sm text-indigo-100 mb-6 z-10 relative">Double your output and scale to 10 series simultaneously with the Vidra Pro engine.</p>
            <Link to="/billing" className="block text-center w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-100 transition-all z-10 relative shadow-lg">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
