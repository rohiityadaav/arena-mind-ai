import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { Users, ShieldAlert, Award, Footprints } from 'lucide-react';

export default function StadiumMap({ zones = [], pois = [], alerts = [], language, onAskAboutZone }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const t = translations[language] || translations.en;

  const getZoneAlerts = (zoneId) => {
    return alerts.filter(a => a.zone_id === zoneId && a.status !== 'resolved');
  };

  // Luxury stroke & fill helper based on crowd density
  const getZoneStyles = (level, isSelected) => {
    const isHigh = level >= 80;
    const isMedium = level >= 50 && level < 80;

    let strokeClass = 'stroke-white/20';
    let fillClass = 'fill-white/[0.02] hover:fill-white/[0.08]';
    let statusBorder = '';

    if (isHigh) {
      strokeClass = isSelected ? 'stroke-rose-600 stroke-[3]' : 'stroke-rose-800/60 hover:stroke-rose-600';
      fillClass = 'fill-rose-950/10 hover:fill-rose-950/20';
      statusBorder = 'border-l-4 border-ops-alert';
    } else if (isMedium) {
      strokeClass = isSelected ? 'stroke-amber-600 stroke-[3]' : 'stroke-amber-800/60 hover:stroke-amber-600';
      fillClass = 'fill-amber-950/5 hover:fill-amber-950/10';
      statusBorder = 'border-l-4 border-ops-caution';
    } else {
      strokeClass = isSelected ? 'stroke-white stroke-[2.5]' : 'stroke-neutral-800 hover:stroke-white/60';
      fillClass = 'fill-white/[0.01] hover:fill-white/[0.06]';
      statusBorder = 'border-l-4 border-neutral-300';
    }

    return { strokeClass, fillClass, statusBorder };
  };

  const activeZone = selectedZone ? zones.find(z => z.id === selectedZone) : null;
  const activeZonePois = selectedZone ? pois.filter(p => p.zone_id === selectedZone) : [];
  const activeZoneAlerts = selectedZone ? getZoneAlerts(selectedZone) : [];
  const zoneStyles = activeZone ? getZoneStyles(activeZone.crowd_level, true) : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sleek Title */}
      <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
        <h2 className="console-header text-xs tracking-widest text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-neutral-400" />
          {t.mapTab}
        </h2>
        <div className="flex gap-4 text-[9px] font-mono tracking-wider text-neutral-500 uppercase">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-neutral-300"></span>CLEAR</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-ops-caution"></span>CAUTION</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-ops-alert animate-pulse"></span>CONGESTED</span>
        </div>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative flex-1 bg-black rounded-none border border-neutral-900 p-6 flex items-center justify-center min-h-[300px]">
        
        {/* Interactive SVG Stadium Map */}
        <svg viewBox="0 0 400 400" className="w-full max-w-[340px] h-auto">
          {/* Background Outer Ring / Parking Lot E/F */}
          {(() => {
            const z = zones.find(z => z.name.includes('E/F'));
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 30, selectedZone === z?.id);
            return (
              <g onClick={() => setSelectedZone(z?.id)} className="cursor-pointer">
                <rect x="250" y="20" width="130" height="80" rx="0" className={`transition-all duration-300 stroke-2 ${strokeClass} ${fillClass}`} />
                <text x="315" y="60" textAnchor="middle" className="fill-neutral-400 font-bold text-[8px] tracking-wider uppercase font-mono pointer-events-none">Lot E/F (GEN)</text>
              </g>
            );
          })()}

          {/* Parking Lot G (ADA) */}
          {(() => {
            const z = zones.find(z => z.name.includes('ADA'));
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 15, selectedZone === z?.id);
            return (
              <g onClick={() => setSelectedZone(z?.id)} className="cursor-pointer">
                <rect x="20" y="300" width="110" height="80" rx="0" className={`transition-all duration-300 stroke-2 ${strokeClass} ${fillClass}`} />
                <text x="75" y="340" textAnchor="middle" className="fill-emerald-500 font-bold text-[8px] tracking-wider uppercase font-mono pointer-events-none">Lot G (ADA) ♿</text>
              </g>
            );
          })()}

          {/* Transit Station */}
          {(() => {
            const z = zones.find(z => z.name.includes('Transit'));
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 40, selectedZone === z?.id);
            return (
              <g onClick={() => setSelectedZone(z?.id)} className="cursor-pointer">
                <rect x="270" y="300" width="110" height="80" rx="0" className={`transition-all duration-300 stroke-2 ${strokeClass} ${fillClass}`} />
                <text x="325" y="340" textAnchor="middle" className="fill-neutral-400 font-bold text-[8px] tracking-wider uppercase font-mono pointer-events-none">Transit Loop</text>
              </g>
            );
          })()}

          {/* Main Stadium Outer Oval */}
          <ellipse cx="200" cy="200" rx="125" ry="105" className="fill-transparent stroke-neutral-900 stroke-2" />

          {/* Stadium Inner Concourses */}
          {/* Plaza level */}
          {(() => {
            const z = zones.find(z => z.name === 'Plaza Level');
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 20, selectedZone === z?.id);
            return (
              <ellipse 
                cx="200" cy="200" rx="110" ry="90" 
                className={`cursor-pointer transition-all duration-300 stroke-1.5 ${strokeClass} ${fillClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}

          {/* Mid concourse */}
          {(() => {
            const z = zones.find(z => z.name.includes('Mid'));
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 30, selectedZone === z?.id);
            return (
              <ellipse 
                cx="200" cy="200" rx="90" ry="72" 
                className={`cursor-pointer transition-all duration-300 stroke-1.5 ${strokeClass} ${fillClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}

          {/* Upper concourse */}
          {(() => {
            const z = zones.find(z => z.name.includes('Upper'));
            const { strokeClass, fillClass } = getZoneStyles(z?.crowd_level || 20, selectedZone === z?.id);
            return (
              <ellipse 
                cx="200" cy="200" rx="70" ry="54" 
                className={`cursor-pointer transition-all duration-300 stroke-1.5 ${strokeClass} ${fillClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}

          {/* Pitch/Field center */}
          <ellipse cx="200" cy="200" rx="45" ry="32" className="fill-neutral-950 stroke-neutral-800 stroke-1 pointer-events-none" />
          <text x="200" y="203" textAnchor="middle" className="fill-neutral-600 text-[8px] font-bold tracking-widest uppercase pointer-events-none">PITCH</text>

          {/* Gate A (North) */}
          {(() => {
            const z = zones.find(z => z.name.includes('Gate A'));
            const { strokeClass } = getZoneStyles(z?.crowd_level || 20, selectedZone === z?.id);
            return (
              <path 
                d="M 175 92 A 25 25 0 0 1 225 92" fill="none" strokeWidth="8" strokeLinecap="square"
                className={`cursor-pointer transition-all duration-300 ${strokeClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}
          <text x="200" y="82" textAnchor="middle" className="fill-neutral-400 font-bold text-[8px] pointer-events-none">GATE A</text>

          {/* Gate B (East) */}
          {(() => {
            const z = zones.find(z => z.name.includes('Gate B'));
            const { strokeClass } = getZoneStyles(z?.crowd_level || 90, selectedZone === z?.id);
            return (
              <path 
                d="M 308 175 A 25 25 0 0 1 308 225" fill="none" strokeWidth="8" strokeLinecap="square"
                className={`cursor-pointer transition-all duration-300 ${strokeClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}
          <text x="325" y="203" textAnchor="middle" className="fill-neutral-400 font-bold text-[8px] pointer-events-none">GATE B</text>

          {/* Gate C (South) */}
          {(() => {
            const z = zones.find(z => z.name.includes('Gate C'));
            const { strokeClass } = getZoneStyles(z?.crowd_level || 20, selectedZone === z?.id);
            return (
              <path 
                d="M 175 308 A 25 25 0 0 0 225 308" fill="none" strokeWidth="8" strokeLinecap="square"
                className={`cursor-pointer transition-all duration-300 ${strokeClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}
          <text x="200" y="325" textAnchor="middle" className="fill-neutral-400 font-bold text-[8px] pointer-events-none">GATE C</text>

          {/* Gate D (West - Priority) */}
          {(() => {
            const z = zones.find(z => z.name.includes('Gate D'));
            const { strokeClass } = getZoneStyles(z?.crowd_level || 20, selectedZone === z?.id);
            return (
              <path 
                d="M 92 175 A 25 25 0 0 0 92 225" fill="none" strokeWidth="8" strokeLinecap="square"
                className={`cursor-pointer transition-all duration-300 ${strokeClass}`}
                onClick={() => setSelectedZone(z?.id)}
              />
            );
          })()}
          <text x="73" y="203" textAnchor="middle" className="fill-emerald-500 font-bold text-[8px] pointer-events-none">GATE D ♿</text>
        </svg>
      </div>

      {/* Selected Zone Drawer (Luxury Pure White Panel) */}
      {activeZone ? (
        <div className="luxury-panel p-5 rounded-none space-y-4">
          <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
            <div>
              <h3 className="console-header text-xs tracking-wider text-neutral-900">{activeZone.name}</h3>
              <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase mt-0.5">{activeZone.zone_type} Zone</p>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-xs text-neutral-400 hover:text-neutral-900 font-bold uppercase tracking-wider"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200/60">
              <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-neutral-600" />
                {t.crowdLevel}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold text-sm text-neutral-900">{activeZone.crowd_level}%</span>
                <div className="flex-1 h-1 bg-neutral-200 overflow-hidden">
                  <div 
                    className={`h-full ${
                      activeZone.crowd_level >= 80 ? 'bg-ops-alert' : activeZone.crowd_level >= 50 ? 'bg-ops-caution' : 'bg-ops-safe'
                    }`}
                    style={{ width: `${activeZone.crowd_level}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200/60">
              <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-neutral-600" />
                {t.accessibilityScore}
              </span>
              <span className="block mt-2 font-bold text-sm text-neutral-900">{activeZone.accessibility_score} / 100</span>
            </div>
          </div>

          {/* Active alerts in zone */}
          {activeZoneAlerts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-mono tracking-wider text-rose-700 font-bold flex items-center gap-1.5 uppercase">
                <ShieldAlert className="h-4 w-4" />
                {t.congestionAlerts}
              </span>
              {activeZoneAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-none text-2xs border ${
                    alert.severity === 'critical' || alert.severity === 'high' 
                      ? 'bg-rose-50 border-rose-200 text-rose-950' 
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <p className="font-bold uppercase tracking-wider">{alert.title}</p>
                  <p className="mt-1 text-neutral-600 leading-relaxed">{alert.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* POIs in zone */}
          {activeZonePois.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">Available Facilities</span>
              <div className="flex flex-wrap gap-1">
                {activeZonePois.map(poi => (
                  <span 
                    key={poi.id} 
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold border rounded-none ${
                      poi.is_accessible 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {poi.name} {poi.is_accessible && '♿'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <button
            onClick={() => onAskAboutZone(activeZone.name)}
            className="w-full py-2 bg-black hover:bg-neutral-900 border border-black text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            <Footprints className="h-4 w-4" />
            Query route or help regarding {activeZone.name.split(' ')[0]}
          </button>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-900 p-4 text-center text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
          Click any zone on the stadium map to inspect crowd levels, access restrooms, or request routing.
        </div>
      )}
    </div>
  );
}
