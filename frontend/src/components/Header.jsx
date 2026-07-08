import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Header({ 
  language, 
  onLogout, 
  toggleSidebar, 
  activeFeature, 
  setActiveFeature,
  safetyLens = false,
  setSafetyLens,
  isDemoMode = false,
  toggleDemoMode
}) {
  const t = translations[language] || translations.en;

  return (
    <header className="border-b border-neutral-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black sticky top-0 z-50 w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Menu 
            className="h-5 w-5 text-neutral-400 cursor-pointer hover:text-white transition-all lg:hidden" 
            onClick={toggleSidebar} 
          />
          <h1 
            className="text-sm font-black tracking-[0.2em] text-white uppercase font-sans cursor-pointer hover:text-neutral-200 transition-all select-none"
            onClick={() => setActiveFeature && setActiveFeature('hero')}
            title="Return to console overview"
          >
            ArenaMind-AI
          </h1>
        </div>
        
        {/* Subtitle hidden when navigation tabs are active on desktop */}
        {activeFeature === 'hero' && (
          <span className="hidden md:inline-block text-[9px] font-mono tracking-widest text-neutral-500 uppercase border-l border-neutral-900 pl-6 mt-0.5 select-none animate-fadeIn">
            Identify your role in the executive ecosystem.
          </span>
        )}

        {/* Laptop/Desktop Main Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-6 border-l border-neutral-900 pl-6">
          <button 
            onClick={() => setActiveFeature && setActiveFeature('assistant')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold ${
              activeFeature === 'assistant' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Command Center Assistant
          </button>
          <button 
            onClick={() => setActiveFeature && setActiveFeature('map')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold ${
              activeFeature === 'map' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Live Zone Map
          </button>
          <button 
            onClick={() => setActiveFeature && setActiveFeature('configs')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold ${
              activeFeature === 'configs' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Ecosystem Configs
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
        {/* Safety Lens Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={safetyLens} 
              onChange={() => setSafetyLens && setSafetyLens(!safetyLens)} 
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-900 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-600 peer-checked:after:bg-emerald-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-950 border border-neutral-800 peer-checked:border-emerald-800"></div>
          </div>
          <span className={`text-[8px] font-mono tracking-widest uppercase transition-all duration-300 ${safetyLens ? 'text-emerald-400 font-extrabold' : 'text-neutral-500 hover:text-neutral-350'}`}>
            Safety Lens
          </span>
        </label>

        {/* Judge Demo Toggle Button */}
        <button
          onClick={() => toggleDemoMode && toggleDemoMode()}
          className={`text-[8px] font-mono tracking-widest uppercase transition-all duration-300 px-2.5 py-1 border rounded-lg flex items-center gap-1.5 ${
            isDemoMode 
              ? 'bg-cyan-950/20 border-cyan-800 text-cyan-400 font-black' 
              : 'bg-neutral-950 border-neutral-900 text-neutral-550 hover:text-neutral-350 hover:border-neutral-800'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-700'}`}></span>
          <span>Judge Demo {isDemoMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Logout / Exit button */}
        <button
          onClick={onLogout}
          className="text-[9px] font-mono tracking-widest text-neutral-550 hover:text-white uppercase transition-all flex items-center gap-1.5 border border-neutral-900 hover:border-neutral-800 px-2 py-1 rounded-lg"
          title={t.backToHome}
        >
          <LogOut className="h-2.5 w-2.5" />
          <span>Exit Console</span>
        </button>

        {/* Circular Avatar */}
        <div className="h-7 w-7 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
            alt="Profile Avatar" 
            className="h-full w-full object-cover opacity-85"
          />
        </div>
      </div>
    </header>
  );
}
