import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Header({ language, onLogout, toggleSidebar }) {
  const t = translations[language] || translations.en;

  return (
    <header className="border-b border-neutral-900 px-6 py-4 flex items-center justify-between bg-black sticky top-0 z-50 w-full">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Menu 
            className="h-5 w-5 text-neutral-400 cursor-pointer hover:text-white transition-all" 
            onClick={toggleSidebar} 
          />
          <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase font-sans">
            ArenaMind-AI
          </h1>
        </div>
        
        {/* Dynamic subtitle matching designed screenshots and layout request */}
        <span className="hidden md:inline-block text-[9px] font-mono tracking-widest text-neutral-500 uppercase border-l border-neutral-900 pl-6 mt-0.5">
          Identify your role in the executive ecosystem.
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Logout / Exit button */}
        <button
          onClick={onLogout}
          className="text-[10px] font-mono tracking-widest text-neutral-500 hover:text-white uppercase transition-all flex items-center gap-1.5 border border-neutral-900 hover:border-neutral-800 px-2.5 py-1 rounded-lg"
          title={t.backToHome}
        >
          <LogOut className="h-3 w-3" />
          <span>Exit Console</span>
        </button>

        {/* Circular Avatar */}
        <div className="h-8 w-8 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center flex-shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
            alt="Profile Avatar" 
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      </div>
    </header>
  );
}
