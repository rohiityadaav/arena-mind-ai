import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { Shield, Users, User, Languages, Eye, Compass, HeartHandshake, EyeOff, Menu } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const [role, setRole] = useState('fan');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    wheelchair: false,
    stepFree: false,
    sensory: false
  });
  const [showBypassDetails, setShowBypassDetails] = useState(false);

  const t = translations[language] || translations.en;

  const handleStart = () => {
    onStart({ role, language, accessibilityNeeds });
  };

  const handleAccToggle = (field) => {
    setAccessibilityNeeds(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-white overflow-y-auto pb-12">
      {/* Header matching WC2026 COMMAND */}
      <header className="border-b border-neutral-900 px-6 py-4 flex items-center justify-between bg-black">
        <div className="flex items-center gap-3">
          <Menu className="h-5 w-5 text-neutral-400 cursor-pointer" />
          <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase font-sans">
            ArenaMind-AI
          </h1>
        </div>
        <div className="h-8 w-8 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
            alt="Profile Avatar" 
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full space-y-6">
        
        {/* Title Block */}
        <div className="w-full text-left space-y-2 mt-4">
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block font-bold">
            SECURITY CLEARANCE REQUIRED
          </span>
          <h2 className="text-3xl font-black italic tracking-wide text-white font-sans leading-tight">
            Identify your role in the <span className="text-neutral-400">executive</span> ecosystem.
          </h2>
        </div>

        {/* Role Cards List */}
        <div className="w-full space-y-3">
          {/* Fan Card */}
          <button
            onClick={() => setRole('fan')}
            className={`w-full text-left p-5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
              role === 'fan' 
                ? 'bg-neutral-950 border-neutral-500 ring-1 ring-neutral-500' 
                : 'bg-neutral-950/40 border-neutral-900 hover:border-neutral-800'
            }`}
          >
            <div className="flex items-start gap-4 pr-4">
              <div className={`p-2.5 rounded-lg border ${
                role === 'fan' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-850'
              }`}>
                <Compass className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white tracking-wide">Spectator/Fan</h3>
                <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                  Access real-time match analytics, immersive stadium AR, and exclusive fan commerce.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-1 flex-shrink-0">
              LVL 1
            </span>
          </button>

          {/* Volunteer Card */}
          <button
            onClick={() => setRole('volunteer')}
            className={`w-full text-left p-5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
              role === 'volunteer' 
                ? 'bg-neutral-950 border-neutral-500 ring-1 ring-neutral-500' 
                : 'bg-neutral-950/40 border-neutral-900 hover:border-neutral-800'
            }`}
          >
            <div className="flex items-start gap-4 pr-4">
              <div className={`p-2.5 rounded-lg border ${
                role === 'volunteer' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-850'
              }`}>
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white tracking-wide">Volunteer</h3>
                <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                  Coordinate field operations, support visitor services, and manage local logistics.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-1 flex-shrink-0">
              LVL 2
            </span>
          </button>

          {/* Operations/Staff Card */}
          <button
            onClick={() => setRole('staff')}
            className={`w-full text-left p-5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
              role === 'staff' 
                ? 'bg-neutral-950 border-neutral-500 ring-1 ring-neutral-500' 
                : 'bg-neutral-950/40 border-neutral-900 hover:border-neutral-800'
            }`}
          >
            <div className="flex items-start gap-4 pr-4">
              <div className={`p-2.5 rounded-lg border ${
                role === 'staff' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-850'
              }`}>
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white tracking-wide">Operations/Staff</h3>
                <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                  Full tactical command. Surveillance, security protocols, and high-level infrastructure control.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-1 flex-shrink-0">
              LVL 4
            </span>
          </button>
        </div>

        {/* Global Preferences Panel (Subtle Dark UI Card) */}
        <div className="w-full bg-neutral-950/50 border border-neutral-900 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase font-bold flex items-center gap-1">
              <Languages className="h-3 w-3" /> INITIAL PROTOCOL PARAMETERS
            </span>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">Select Language</span>
            <div className="grid grid-cols-3 gap-2">
              {[['en', 'English'], ['es', 'Español'], ['fr', 'Français']].map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`py-1.5 px-2 border text-[9px] uppercase tracking-wider font-bold rounded-lg transition-all ${
                    language === code
                      ? 'bg-white border-white text-black'
                      : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-2 pt-1.5 border-t border-neutral-900/50">
            <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">Accessibility Inclusions</span>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-350 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.wheelchair}
                  onChange={() => handleAccToggle('wheelchair')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Wheelchair Seating (Section 112)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-355 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.stepFree}
                  onChange={() => handleAccToggle('stepFree')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Step-free Path (Elevators / Ramps)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-355 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.sensory}
                  onChange={() => handleAccToggle('sensory')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Sensory Room Guide (Section 224C)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Nodes indicator */}
        <div className="flex items-center gap-2 text-neutral-500 font-bold font-mono text-[9px] tracking-widest pt-2">
          <div className="flex -space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-750"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 animate-status-blink"></div>
          </div>
          <span>14.2K ACTIVE NODES</span>
        </div>

        {/* Initialize Button (Pill Gradient White-to-Gray) */}
        <div className="w-full pt-1">
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-gradient-to-r from-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-200 text-black font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-lg rounded-full"
          >
            INITIALIZE COMMAND
          </button>
        </div>

        {/* Secondary bypass link */}
        <button
          onClick={() => setShowBypassDetails(!showBypassDetails)}
          className="text-[9px] font-mono tracking-widest text-neutral-500 hover:text-neutral-300 uppercase transition-all underline decoration-neutral-800"
        >
          SECONDARY BYPASS
        </button>

        {showBypassDetails && (
          <div className="p-3 bg-neutral-950 border border-neutral-900 text-[9px] text-neutral-550 leading-relaxed uppercase tracking-wider font-mono w-full text-center rounded-lg animate-fadeIn">
            Bypass active. Local rules engine loaded. No external API requirement.
          </div>
        )}

      </div>
    </div>
  );
}
