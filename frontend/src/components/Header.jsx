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
    <header className="border-b border-neutral-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black sticky top-0 z-50 w-full" role="banner">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Menu 
            className="h-5 w-5 text-neutral-400 cursor-pointer hover:text-white transition-all lg:hidden focus:outline-none focus:ring-1 focus:ring-white rounded" 
            onClick={toggleSidebar} 
            role="button"
            tabIndex={0}
            aria-label="Open ecosystem configurations panel drawer"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSidebar(); } }}
          />
          <h1 
            className="text-sm font-black tracking-[0.2em] text-white uppercase font-sans cursor-pointer hover:text-neutral-200 transition-all select-none focus:outline-none focus:ring-1 focus:ring-white px-1 rounded"
            onClick={() => setActiveFeature && setActiveFeature('hero')}
            title="Return to console overview"
            role="link"
            tabIndex={0}
            aria-label="ArenaMind-AI homepage, return to clearance protocols"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveFeature && setActiveFeature('hero'); } }}
          >
            ArenaMind-AI
          </h1>
        </div>
        
        {/* Subtitle hidden when navigation tabs are active on desktop */}
        {activeFeature === 'hero' && (
          <span className="hidden md:inline-block text-[9px] font-mono tracking-widest text-neutral-500 uppercase border-l border-neutral-900 pl-6 mt-0.5 select-none" aria-live="polite">
            Identify your role in the executive ecosystem.
          </span>
        )}

        {/* Laptop/Desktop Main Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-6 border-l border-neutral-900 pl-6" aria-label="Desktop console tabs" role="tablist">
          <button 
            onClick={() => setActiveFeature && setActiveFeature('assistant')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold focus:outline-none focus:ring-1 focus:ring-white px-2 py-0.5 rounded ${
              activeFeature === 'assistant' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-selected={activeFeature === 'assistant'}
            role="tab"
            aria-label="Load Command Center Assistant chat panel"
          >
            Command Center Assistant
          </button>
          <button 
            onClick={() => setActiveFeature && setActiveFeature('map')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold focus:outline-none focus:ring-1 focus:ring-white px-2 py-0.5 rounded ${
              activeFeature === 'map' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-selected={activeFeature === 'map'}
            role="tab"
            aria-label="Load Live Zone Map interactive dashboard"
          >
            Live Zone Map
          </button>
          <button 
            onClick={() => setActiveFeature && setActiveFeature('configs')} 
            className={`text-[9px] font-mono tracking-widest uppercase transition-all duration-300 font-bold focus:outline-none focus:ring-1 focus:ring-white px-2 py-0.5 rounded ${
              activeFeature === 'configs' 
                ? 'text-white border-b border-white pb-0.5' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            aria-selected={activeFeature === 'configs'}
            role="tab"
            aria-label="Load Ecosystem Configurations settings console"
          >
            Ecosystem Configs
          </button>
        </nav>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
        {/* Safety Lens Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none" aria-label="Toggle Safety Lens overlay and instructions">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={safetyLens} 
              onChange={() => setSafetyLens && setSafetyLens(!safetyLens)} 
              className="sr-only peer"
              aria-checked={safetyLens}
              role="switch"
              aria-label="Safety Lens filter overlay toggle"
            />
            <div className="w-8 h-4 bg-neutral-900 rounded-full peer peer-focus:ring-1 peer-focus:ring-white peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-600 peer-checked:after:bg-emerald-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-950 border border-neutral-800 peer-checked:border-emerald-800"></div>
          </div>
          <span className={`text-[8px] font-mono tracking-widest uppercase transition-all duration-300 ${safetyLens ? 'text-emerald-400 font-extrabold' : 'text-neutral-500 hover:text-neutral-350'}`}>
            Safety Lens
          </span>
        </label>

        {/* Judge Demo Toggle Button */}
        <button
          onClick={() => toggleDemoMode && toggleDemoMode()}
          className={`text-[8px] font-mono tracking-widest uppercase transition-all duration-300 px-2.5 py-1 border rounded-lg flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-white ${
            isDemoMode 
              ? 'bg-cyan-950/20 border-cyan-800 text-cyan-400 font-black' 
              : 'bg-neutral-950 border-neutral-900 text-neutral-550 hover:text-neutral-350 hover:border-neutral-800'
          }`}
          role="switch"
          aria-checked={isDemoMode}
          aria-label="Toggle preloaded Judge Demo Mode settings and overlays"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-700'}`}></span>
          <span>Judge Demo {isDemoMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Logout / Exit button */}
        <button
          onClick={onLogout}
          className="text-[9px] font-mono tracking-widest text-neutral-550 hover:text-white uppercase transition-all flex items-center gap-1.5 border border-neutral-900 hover:border-neutral-800 px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-white"
          title={t.backToHome}
          aria-label="Exit current session console and reset state"
        >
          <LogOut className="h-2.5 w-2.5" />
          <span>Exit Console</span>
        </button>

        {/* Circular Avatar */}
        <div className="h-7 w-7 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center flex-shrink-0" role="img" aria-label="User profile photo avatar">
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
