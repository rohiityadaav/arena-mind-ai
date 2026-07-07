import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { ShieldAlert, TrendingUp, Users, HeartHandshake, CheckCircle2, Circle } from 'lucide-react';

export default function Dashboard({ stadium, zones = [], alerts = [], onRefreshAlerts, language }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alertType, setAlertType] = useState('congestion');
  const [severity, setSeverity] = useState('medium');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const t = translations[language] || translations.en;

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!title.trim() || !stadium) return;

    setIsPublishing(true);
    try {
      await api.createAlert({
        stadium_id: stadium.id,
        zone_id: selectedZoneId || null,
        alert_type: alertType,
        severity,
        title,
        description
      });
      setTitle('');
      setDescription('');
      setSelectedZoneId('');
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
      alert('Failed to publish operational alert');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateAlertStatus(id, status);
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
      alert('Failed to update alert status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.deleteAlert(id);
      onRefreshAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      
      {/* Analytics Cards (Luxury White Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Occupancy */}
        <div className="luxury-panel p-4 rounded-none flex items-center gap-4">
          <div className="p-3 bg-neutral-100 text-neutral-900 border border-neutral-200">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-bold">{t.metricsTitle}</span>
            <span className="block text-base font-black text-neutral-900 leading-tight">78,420 / 82.5K</span>
            <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" /> 95% CAPACITY
            </span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="luxury-panel p-4 rounded-none flex items-center gap-4">
          <div className="p-3 bg-neutral-100 text-rose-700 border border-neutral-200">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-bold">{t.activeAlertsCount}</span>
            <span className="block text-base font-black text-neutral-900 leading-tight">{activeAlerts.length} Active</span>
            <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider block mt-0.5">
              {resolvedAlerts.length} RESOLVED TODAY
            </span>
          </div>
        </div>

        {/* ADA Assistance requests */}
        <div className="luxury-panel p-4 rounded-none flex items-center gap-4">
          <div className="p-3 bg-neutral-100 text-neutral-900 border border-neutral-200">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-bold">{t.accessibilityRequests}</span>
            <span className="block text-base font-black text-neutral-900 leading-tight">142 Requests</span>
            <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider block mt-0.5">
              ELEVATOR PRIORITIES ACTIVE
            </span>
          </div>
        </div>

        {/* Average gate wait time */}
        <div className="luxury-panel p-4 rounded-none flex items-center gap-4">
          <div className="p-3 bg-neutral-100 text-amber-700 border border-neutral-200">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[8px] font-mono tracking-widest text-neutral-400 uppercase font-bold">Gate Wait Avg</span>
            <span className="block text-base font-black text-neutral-900 leading-tight">9.2 Minutes</span>
            <span className="text-[9px] text-rose-700 font-bold uppercase tracking-wider block mt-0.5">
              GATE B QUEUES HEAVY
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create Alert Form (Luxury White Card) */}
        <div className="luxury-panel p-5 rounded-none space-y-4">
          <h3 className="console-header text-xs tracking-widest text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
            <ShieldAlert className="h-4 w-4 text-neutral-700" />
            {t.createAlert}
          </h3>

          <form onSubmit={handleCreateAlert} className="space-y-3">
            <div>
              <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">{t.alertTitleInput}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Section 109 Elevator Outage"
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none focus:outline-none focus:border-neutral-500"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">{t.alertDescInput}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe operational changes or bottleneck details..."
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none h-20 resize-none focus:outline-none focus:border-neutral-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">{t.alertTypeSelect}</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none focus:outline-none focus:border-neutral-500"
                >
                  <option value="congestion">Congestion</option>
                  <option value="delay">Delay</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">{t.severitySelect}</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none focus:outline-none focus:border-neutral-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase mb-1">{t.zoneSelect}</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-2 text-xs rounded-none focus:outline-none focus:border-neutral-500"
              >
                <option value="">All Zones (General)</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPublishing || !title.trim()}
              className="w-full py-2.5 bg-black hover:bg-neutral-900 border border-black text-white font-bold uppercase tracking-widest text-2xs transition-all shadow-sm"
            >
              {t.submitAlert}
            </button>
          </form>
        </div>

        {/* Right Side: Active Incident Log (Luxury White Card) */}
        <div className="lg:col-span-2 luxury-panel p-5 rounded-none space-y-4">
          <h3 className="console-header text-xs tracking-widest text-neutral-900 flex items-center gap-2 border-b border-neutral-200 pb-2">
            <ShieldAlert className="h-4 w-4 text-neutral-700" />
            OPERATIONS INCIDENT LOG ({activeAlerts.length})
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                No active incidents. Venue operations fully stable.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 border flex flex-col sm:flex-row justify-between gap-4 transition-all rounded-none ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 border-rose-200'
                      : alert.severity === 'high'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 border ${
                        alert.severity === 'critical' ? 'bg-rose-200 text-rose-950 border-rose-300' : alert.severity === 'high' ? 'bg-amber-100 text-amber-950 border-amber-200' : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">Type: {alert.alert_type}</span>
                      {alert.zone_name && (
                        <span className="text-[9px] font-bold text-neutral-900 uppercase font-mono tracking-wider">@ {alert.zone_name}</span>
                      )}
                    </div>
                    
                    <h4 className="font-extrabold text-xs text-neutral-900 tracking-wide uppercase mt-2">{alert.title}</h4>
                    <p className="text-2xs text-neutral-600 leading-relaxed mt-0.5">{alert.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-neutral-500 uppercase mt-3 pt-2 border-t border-neutral-200/50">
                      {alert.status === 'open' ? (
                        <span className="text-rose-700 flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-rose-700" /> Open Unresolved
                        </span>
                      ) : (
                        <span className="text-neutral-900 flex items-center gap-1">
                          <Circle className="h-2.5 w-2.5 fill-neutral-900" /> Acknowledged by Command
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col justify-end items-end gap-2 flex-wrap">
                    {alert.status === 'open' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                        className="px-3 py-1 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-900 text-[9px] font-bold uppercase tracking-wider transition-all"
                      >
                        {t.ackButton}
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                      className="px-3 py-1 bg-black hover:bg-neutral-900 text-white border border-black text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {t.resolveButton}
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="px-3 py-1 hover:bg-red-50 text-neutral-400 hover:text-red-700 text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
