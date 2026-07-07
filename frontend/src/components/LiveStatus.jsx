import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { Activity, Clock, ShieldAlert, Bus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveStatus({ stadium, alerts = [], onRefreshAlerts, language }) {
  const [showReporter, setShowReporter] = useState(false);
  const [alertType, setAlertType] = useState('congestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const t = translations[language] || translations.en;

  const handleReport = async (e) => {
    e.preventDefault();
    if (!title.trim() || !stadium) return;

    setIsSubmitting(true);
    try {
      await api.createAlert({
        stadium_id: stadium.id,
        zone_id: null,
        alert_type: alertType,
        severity: alertType === 'medical' ? 'critical' : 'medium',
        title: title,
        description: description
      });
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      onRefreshAlerts();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReporter(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to report incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  const gates = [
    { name: 'Gate A (North)', time: '5m', status: 'clear', isCongested: false },
    { name: 'Gate B (East)', time: '25m', status: 'heavy wait', isCongested: true },
    { name: 'Gate C (South)', time: '4m', status: 'clear', isCongested: false },
    { name: 'Gate D (West - ADA)', time: '3m', status: 'clear', isCongested: false }
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title */}
      <h2 className="console-header text-xs tracking-widest text-white border-b border-neutral-900 pb-2 flex items-center gap-2">
        <Activity className="h-4 w-4 text-neutral-400" />
        {t.statusTab}
      </h2>

      {/* Gate Wait Times (Luxury white panel) */}
      <div className="luxury-panel p-4 rounded-none space-y-3">
        <h3 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
          <Clock className="h-3.5 w-3.5 text-neutral-700" />
          {t.stadiumGateStatus}
        </h3>
        <div className="space-y-2">
          {gates.map((g, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-1 px-2 bg-neutral-50 border border-neutral-150">
              <span className="text-neutral-900 font-bold uppercase text-[10px] tracking-wider">{g.name}</span>
              <div className="text-right">
                <span className={`block text-xs font-black ${g.isCongested ? 'text-rose-700 font-black animate-pulse' : 'text-neutral-900'}`}>{g.time}</span>
                <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase">{g.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shuttle & Transit Schedule */}
      <div className="luxury-panel p-4 rounded-none space-y-3">
        <h3 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
          <Bus className="h-3.5 w-3.5 text-neutral-700" />
          {t.shuttleSchedule}
        </h3>
        <div className="p-3 bg-neutral-50 border border-neutral-200/60">
          <div className="flex justify-between font-bold text-[10px] uppercase tracking-wider text-neutral-900">
            <span>Transit Loop ♿</span>
            <span className="font-mono text-neutral-500">Every 5 mins</span>
          </div>
          <p className="mt-1 text-[10px] text-neutral-500 leading-relaxed">
            Connects Lot G directly with the shuttle loop. Double decker accessible vehicles are currently active.
          </p>
        </div>
      </div>

      {/* Live Incidents Alerts List */}
      <div className="flex-1 bg-neutral-950 border border-neutral-900 p-4 rounded-none space-y-3 overflow-y-auto max-h-[220px]">
        <h3 className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase flex items-center gap-1.5 border-b border-neutral-900 pb-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-neutral-500" />
          {t.congestionAlerts}
        </h3>
        {activeAlerts.length === 0 ? (
          <p className="text-[9px] font-mono tracking-wider text-neutral-600 uppercase text-center py-4">No active incidents. Venue stable.</p>
        ) : (
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-none text-2xs border ${
                  alert.severity === 'critical' 
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-200' 
                    : alert.severity === 'high'
                      ? 'bg-amber-950/15 border-amber-900/40 text-amber-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold uppercase tracking-widest text-[8px] font-mono">
                    {alert.alert_type}
                  </span>
                  <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase">
                    {alert.zone_name || 'All'}
                  </span>
                </div>
                <p className="font-bold mt-1 text-white uppercase tracking-wider">{alert.title}</p>
                <p className="text-neutral-500 mt-1 leading-snug">{alert.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Incident Trigger */}
      <div className="pt-2">
        {showReporter ? (
          <form onSubmit={handleReport} className="bg-white border border-neutral-200 p-4 rounded-none space-y-3 text-neutral-900">
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-900">{t.incidentReportTitle}</h3>
            
            {submitSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-none text-[10px] text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-bold uppercase tracking-wider">{t.incidentSuccess}</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[8px] font-mono tracking-wider text-neutral-400 uppercase mb-1">Issue Type</label>
                  <select 
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 px-2 py-1.5 text-xs rounded-none focus:outline-none focus:border-neutral-500 font-sans"
                  >
                    <option value="congestion">Bottleneck / Crowd Congestion</option>
                    <option value="delay">Transit Delay</option>
                    <option value="medical">Medical Assistance Required</option>
                    <option value="maintenance">Maintenance / Elevator Outage</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.alertTitleInput}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 px-2 py-1.5 text-xs rounded-none focus:outline-none focus:border-neutral-500"
                    required
                  />
                </div>
                <div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.incidentDescPlaceholder}
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none h-16 resize-none focus:outline-none focus:border-neutral-500"
                  ></textarea>
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowReporter(false)}
                    className="px-3 py-1.5 text-[9px] uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-none font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="px-3 py-1.5 text-[9px] uppercase tracking-wider bg-black hover:bg-neutral-900 text-white rounded-none font-bold disabled:opacity-55"
                  >
                    Send Report
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <button
            onClick={() => setShowReporter(true)}
            className="w-full py-2.5 bg-black hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-none text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="h-4 w-4" />
            {t.reportIssue}
          </button>
        )}
      </div>

    </div>
  );
}
