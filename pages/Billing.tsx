
import React from 'react';
import { SubscriptionPlan } from '../types';

const Billing: React.FC = () => {
  const plans = [
    {
      name: SubscriptionPlan.STARTER,
      price: '$19',
      features: ['3 Videos / week', 'Single Series', 'TikTok, Shorts & Reels', 'Standard Support', 'Watermark on exports'],
      isCurrent: true,
      buttonText: 'Current Plan'
    },
    {
      name: SubscriptionPlan.DAILY,
      price: '$49',
      features: ['1 Video / day', '3 Content Series', 'No Watermarks', 'Priority Queue', 'TikTok, Shorts & Reels'],
      isCurrent: false,
      buttonText: 'Upgrade to Daily',
      highlight: true
    },
    {
      name: SubscriptionPlan.PRO,
      price: '$99',
      features: ['2 Videos / day', 'Unlimited Series', 'Multi-Platform Sync (Inc. Reels)', 'Dedicated Account Manager', 'Custom Voice Models'],
      isCurrent: false,
      buttonText: 'Go Pro'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-4">Choose Your Growth Speed</h1>
        <p className="text-slate-400 text-lg">Automate your faceless empire with the right level of horsepower.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative rounded-3xl p-8 flex flex-col h-full border ${plan.highlight ? 'bg-slate-900 border-indigo-500 ring-4 ring-indigo-500/10' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} transition-all group`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{plan.name} Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-300 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-indigo-500 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                plan.isCurrent 
                  ? 'bg-slate-800 text-slate-400 cursor-default' 
                  : plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Invoices & Payment</h3>
            <div className="divide-y divide-slate-800">
               {[
                 { date: 'Oct 01, 2023', amount: '$19.00', status: 'Paid', id: '#INV-8821' },
                 { date: 'Sep 01, 2023', amount: '$19.00', status: 'Paid', id: '#INV-7712' }
               ].map((inv) => (
                 <div key={inv.id} className="py-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                       <span className="font-mono text-slate-500">{inv.id}</span>
                       <span className="text-slate-300">{inv.date}</span>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className="font-bold text-white">{inv.amount}</span>
                       <span className="text-emerald-500 font-medium">{inv.status}</span>
                       <button className="text-indigo-400 hover:text-indigo-300">PDF</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Billing;
