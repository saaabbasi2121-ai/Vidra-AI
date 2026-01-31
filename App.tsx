
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ICONS } from './constants';
import Dashboard from './pages/Dashboard';
import SeriesManagement from './pages/SeriesManagement';
import VideoQueue from './pages/VideoQueue';
import Billing from './pages/Billing';
import GeneratorDemo from './pages/GeneratorDemo';
import SocialSettings from './pages/SocialSettings';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <ICONS.Dashboard className="w-5 h-5" /> },
    { name: 'My Series', path: '/series', icon: <ICONS.Series className="w-5 h-5" /> },
    { name: 'Video Queue', path: '/queue', icon: <ICONS.Queue className="w-5 h-5" /> },
    { name: 'Generator Lab', path: '/generator', icon: <ICONS.Link className="w-5 h-5" /> },
    { name: 'Socials', path: '/socials', icon: <ICONS.Link className="w-5 h-5" /> },
    { name: 'Billing', path: '/billing', icon: <ICONS.Billing className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-500 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-black">V</div>
          Vidra
        </h1>
      </div>
      
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Weekly Credits</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Starter</span>
            <span className="text-xs text-indigo-400 font-bold">2 / 3 used</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '66%' }}></div>
          </div>
          <Link to="/billing" className="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg transition-colors">
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-200">Vidra Factory</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-400/50"></div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-950 text-slate-200">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/series" element={<SeriesManagement />} />
              <Route path="/queue" element={<VideoQueue />} />
              <Route path="/generator" element={<GeneratorDemo />} />
              <Route path="/socials" element={<SocialSettings />} />
              <Route path="/billing" element={<Billing />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
