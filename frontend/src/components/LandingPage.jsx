import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { Shield, Users, User, Languages, Eye } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const [role, setRole] = useState('fan');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    wheelchair: false,
    stepFree: false,
    sensory: false
  });

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
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      {/* Central control station panel */}
      <div className="max-w-4xl w-full space-y-8 luxury-panel-dark p-8 md:p-10 rounded-none border border-neutral-800">
        
        {/* Sleek Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-none border border-neutral-800 text-neutral-400 mb-2">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-widest text-white uppercase font-sans">
            ARENAMIND - AI
          </h1>
          <p className="console-label text-2xs text-neutral-500 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          
          {/* Left Column: Role Selector (Premium White Cards on Dark Canvas) */}
          <div className="space-y-4">
            <h2 className="console-header text-xs text-neutral-400 border-b border-neutral-900 pb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-400" />
              {t.selectRole}
            </h2>
            
            <div className="space-y-3">
              {/* Fan Card */}
              <button
                onClick={() => setRole('fan')}
                className={`w-full text-left p-4 rounded-none transition-all border ${
                  role === 'fan' 
                    ? 'bg-white border-white text-neutral-900' 
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-none ${role === 'fan' ? 'bg-neutral-900 text-white' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">{t.roleFan}</h3>
                    <p className="text-[10px] mt-0.5 opacity-80 leading-relaxed">{t.roleFanDesc}</p>
                  </div>
                </div>
              </button>

              {/* Volunteer Card */}
              <button
                onClick={() => setRole('volunteer')}
                className={`w-full text-left p-4 rounded-none transition-all border ${
                  role === 'volunteer' 
                    ? 'bg-white border-white text-neutral-900' 
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-none ${role === 'volunteer' ? 'bg-neutral-900 text-white' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">{t.roleVolunteer}</h3>
                    <p className="text-[10px] mt-0.5 opacity-80 leading-relaxed">{t.roleVolunteerDesc}</p>
                  </div>
                </div>
              </button>

              {/* Staff Card */}
              <button
                onClick={() => setRole('staff')}
                className={`w-full text-left p-4 rounded-none transition-all border ${
                  role === 'staff' 
                    ? 'bg-white border-white text-neutral-900' 
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-none ${role === 'staff' ? 'bg-neutral-900 text-white' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">{t.roleStaff}</h3>
                    <p className="text-[10px] mt-0.5 opacity-80 leading-relaxed">{t.roleStaffDesc}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Preferences */}
          <div className="space-y-6">
            
            {/* Language Switcher */}
            <div className="space-y-3">
              <h2 className="console-header text-xs text-neutral-400 border-b border-neutral-900 pb-2 flex items-center gap-2">
                <Languages className="h-4 w-4 text-neutral-400" />
                {t.selectLang}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[['en', 'English'], ['es', 'Español'], ['fr', 'Français']].map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`py-2 px-3 border text-2xs uppercase tracking-wider font-bold transition-all rounded-none ${
                      language === code
                        ? 'bg-white border-white text-neutral-900'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility Settings */}
            <div className="space-y-3">
              <h2 className="console-header text-xs text-neutral-400 border-b border-neutral-900 pb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-neutral-400" />
                {t.accessibilityToggle}
              </h2>
              <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-4">
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  {t.accessibilityDesc}
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={accessibilityNeeds.wheelchair}
                      onChange={() => handleAccToggle('wheelchair')}
                      className="w-4 h-4 rounded-none bg-neutral-900 border-neutral-800 text-white focus:ring-white"
                    />
                    <span className="font-semibold uppercase tracking-wide">Wheelchair Seating (Section 112)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={accessibilityNeeds.stepFree}
                      onChange={() => handleAccToggle('stepFree')}
                      className="w-4 h-4 rounded-none bg-neutral-900 border-neutral-800 text-white focus:ring-white"
                    />
                    <span className="font-semibold uppercase tracking-wide">Step-free Path (Elevators / Ramps)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={accessibilityNeeds.sensory}
                      onChange={() => handleAccToggle('sensory')}
                      className="w-4 h-4 rounded-none bg-neutral-900 border-neutral-800 text-white focus:ring-white"
                    />
                    <span className="font-semibold uppercase tracking-wide">Sensory Room Guide (Section 224C)</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-xs transition-all border border-white"
          >
            {t.enterApp}
          </button>
        </div>

      </div>
    </div>
  );
}
