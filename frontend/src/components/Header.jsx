import React from 'react';
import { translations } from '../utils/translations';
import { Shield, Eye, LogOut } from 'lucide-react';

export default function Header({ 
  role, 
  language, 
  accessibilityEnabled, 
  setRole, 
  setLanguage, 
  toggleAccessibility, 
  onLogout 
}) {
  const t = translations[language] || translations.en;

  return (
    <header className="bg-black border-b border-neutral-900 sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      {/* Sleek Branding */}
      <div className="flex items-center gap-3">
        <div className="p-2 border border-neutral-800 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-sm font-extrabold tracking-widest text-white uppercase font-sans">
            ARENAMIND - COMMAND
          </h1>
          <p className="text-[9px] tracking-wider text-neutral-500 uppercase font-mono">METLIFE STADIUM // TOURNAMENT CONSOLE</p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Role Selector quick switch */}
        <div className="flex bg-neutral-950 p-1 border border-neutral-900">
          {['fan', 'volunteer', 'staff'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                role === r
                  ? 'bg-white text-black border-white'
                  : 'text-neutral-500 border-transparent hover:text-neutral-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Language selector select box */}
        <div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black border border-neutral-900 text-neutral-400 hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-neutral-700"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
        </div>

        {/* Accessibility Toggle */}
        <button
          onClick={toggleAccessibility}
          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
            accessibilityEnabled
              ? 'bg-white text-black border-white'
              : 'bg-black border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
          aria-label={t.accessibilityToggle}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{t.accessibilityToggle}</span>
        </button>

        {/* Vertical thin separator */}
        <div className="hidden sm:block h-6 w-px bg-neutral-900"></div>

        {/* Exit Button */}
        <button
          onClick={onLogout}
          className="p-2 bg-black border border-neutral-900 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all"
          title={t.backToHome}
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>

      </div>
    </header>
  );
}
