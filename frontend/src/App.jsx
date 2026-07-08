import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import ChatAssistant from './components/ChatAssistant';
import StadiumMap from './components/StadiumMap';
import FeedbackModal from './components/FeedbackModal';
import { api } from './services/api';
import { translations } from './utils/translations';
import { 
  LayoutGrid, 
  Map as MapIcon, 
  Sparkles, 
  Settings, 
  Compass, 
  HeartHandshake, 
  Shield, 
  Plus, 
  ShieldAlert, 
  Check, 
  Signal,
  Wifi,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [started, setStarted] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [activeFeature, setActiveFeature] = useState('hero');
  const [role, setRole] = useState('fan');
  const [language, setLanguage] = useState('en');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    wheelchair: false,
    stepFree: false,
    sensory: false
  });
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // Data State
  const [stadium, setStadium] = useState(null);
  const [zones, setZones] = useState([]);
  const [pois, setPois] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Interaction State
  const [prefillQuery, setPrefillQuery] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // For mobile layout: bottom tab bar ('dashboard', 'map', 'chat')
  const [activeTab, setActiveTab] = useState('chat'); 

  // Collapsible sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Staff alert creation state
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertDesc, setNewAlertDesc] = useState('');
  const [newAlertSeverity, setNewAlertSeverity] = useState('medium');
  const [newAlertZoneId, setNewAlertZoneId] = useState('');

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  // Safety Lens & Judge Demo states
  const [safetyLens, setSafetyLens] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [savedDemoState, setSavedDemoState] = useState(null);

  const calculateAccessibilityScore = () => {
    let score = 92;
    const activeCriticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const activeWarningAlerts = activeAlerts.filter(a => a.severity === 'high' || a.severity === 'medium').length;
    
    score -= activeCriticalAlerts * 12;
    score -= activeWarningAlerts * 6;
    
    if (accessibilityNeeds.wheelchair) score += 3;
    if (accessibilityNeeds.stepFree) score += 3;
    if (accessibilityNeeds.sensory) score += 2;
    
    return Math.max(10, Math.min(score, 100));
  };

  const toggleDemoMode = () => {
    if (!isDemoMode) {
      setSavedDemoState({
        role,
        language,
        accessibilityNeeds,
        accessibilityEnabled,
        alerts,
        activeFeature
      });

      setRole('fan');
      setLanguage('en');
      setAccessibilityNeeds({ wheelchair: true, stepFree: true, sensory: false });
      setAccessibilityEnabled(true);
      setActiveFeature('assistant');
      setAlerts([
        {
          id: 'demo-alert-1',
          stadium_id: 1,
          zone_id: 'gate-b',
          alert_type: 'congestion',
          severity: 'high',
          status: 'active',
          title: 'Gate B Crowd Congestion',
          description: 'Heavy congestion at Gate B. Queue wait times exceeding 45 minutes.'
        },
        {
          id: 'demo-alert-2',
          stadium_id: 1,
          zone_id: 'section-112',
          alert_type: 'incident',
          severity: 'critical',
          status: 'active',
          title: 'Section 112 Medical Emergency',
          description: 'Medical team dispatched to Section 112. Please clear transit corridors.'
        },
        {
          id: 'demo-alert-3',
          stadium_id: 1,
          zone_id: 'gate-4',
          alert_type: 'maintenance',
          severity: 'medium',
          status: 'active',
          title: 'Elevator Lobby Maintenance',
          description: 'Elevator 4 out of service for inspection. Use Elevator 3 for step-free access.'
        }
      ]);
      setIsDemoMode(true);
    } else {
      if (savedDemoState) {
        setRole(savedDemoState.role);
        setLanguage(savedDemoState.language);
        setAccessibilityNeeds(savedDemoState.accessibilityNeeds);
        setAccessibilityEnabled(savedDemoState.accessibilityEnabled);
        setAlerts(savedDemoState.alerts);
        setActiveFeature(savedDemoState.activeFeature);
      } else {
        refreshAlerts();
      }
      setIsDemoMode(false);
    }
  };

  const t = translations[language] || translations.en;

  // Load Stadium & Alerts Data
  const loadData = async () => {
    try {
      const data = await api.getStadiumData();
      if (data.stadium) {
        setStadium(data.stadium);
        setZones(data.zones);
        setPois(data.pois);
      }
      const activeAlerts = await api.getAlerts();
      setAlerts(activeAlerts);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll alerts every 5 seconds for live status
    const interval = setInterval(() => {
      refreshAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync initial sidebar visibility: Open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize(); // Call at mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [started]);

  const refreshAlerts = async () => {
    try {
      const activeAlerts = await api.getAlerts();
      setAlerts(activeAlerts);
      const data = await api.getStadiumData();
      if (data.zones) setZones(data.zones);
    } catch (err) {
      console.error('Failed to poll alerts:', err);
    }
  };

  const handleStart = ({ role: r, language: l, accessibilityNeeds: acc }) => {
    setRole(r);
    setLanguage(l);
    setAccessibilityNeeds(acc);
    setAccessibilityEnabled(acc.wheelchair || acc.stepFree || acc.sensory);
    setStarted(true);
  };

  const handleLogout = () => {
    setStarted(false);
    setSessionId('');
    setPrefillQuery('');
  };

  const handleAccToggle = (field) => {
    setAccessibilityNeeds(prev => {
      const updated = { ...prev, [field]: !prev[field] };
      setAccessibilityEnabled(updated.wheelchair || updated.stepFree || updated.sensory);
      return updated;
    });
  };

  const handleAskAboutZone = (zoneName) => {
    const query = language === 'es' 
      ? `¿Cómo llego a ${zoneName}?`
      : language === 'fr'
        ? `Comment puis-je me rendre à ${zoneName} ?`
        : `How do I reach ${zoneName}?`;
    
    setPrefillQuery(query);
    setActiveTab('chat'); // Switch tab on mobile
  };

  // Staff alert handlers
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlertTitle.trim() || !stadium) return;

    try {
      await api.createAlert({
        stadium_id: stadium.id,
        zone_id: newAlertZoneId || null,
        alert_type: 'congestion',
        severity: newAlertSeverity,
        title: newAlertTitle,
        description: newAlertDesc
      });
      setNewAlertTitle('');
      setNewAlertDesc('');
      setNewAlertZoneId('');
      setShowAddAlert(false);
      refreshAlerts();
    } catch (err) {
      console.error(err);
      alert('Failed to publish alert');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateAlertStatus(id, status);
      refreshAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!confirm('Resolve and clear this operational record?')) return;
    try {
      await api.deleteAlert(id);
      refreshAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Shared Sidebar contents to avoid duplication
  const renderSidebarContents = (isDrawer = false) => {
    return (
      <div className="flex flex-col justify-between h-full space-y-6">
        <div className="space-y-6">
          <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase block font-bold">
                ACCESS CLEARANCE
              </span>
              <h3 className="text-lg font-black italic text-white mt-1">Ecosystem Configs</h3>
            </div>
            {isDrawer && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-xs text-neutral-500 hover:text-white uppercase font-bold"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Role selection */}
          <div className="space-y-3">
            {/* Fan */}
            <button
              onClick={() => {
                setRole('fan');
                if (isDrawer) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                role === 'fan' 
                  ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' 
                  : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3 pr-2">
                <div className={`p-1.5 rounded border ${
                  role === 'fan' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-500 border-neutral-850'
                }`}>
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Spectator/Fan</h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 1 operational clearance.</p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                LVL 1
              </span>
            </button>

            {/* Volunteer */}
            <button
              onClick={() => {
                setRole('volunteer');
                if (isDrawer) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                role === 'volunteer' 
                  ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' 
                  : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3 pr-2">
                <div className={`p-1.5 rounded border ${
                  role === 'volunteer' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-500 border-neutral-850'
                }`}>
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Volunteer</h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 2 task administration.</p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                LVL 2
              </span>
            </button>

            {/* Staff */}
            <button
              onClick={() => {
                setRole('staff');
                if (isDrawer) setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                role === 'staff' 
                  ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' 
                  : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3 pr-2">
                <div className={`p-1.5 rounded border ${
                  role === 'staff' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-500 border-neutral-850'
                }`}>
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Operations/Staff</h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 4 full tactical command.</p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                LVL 4
              </span>
            </button>
          </div>

          {/* Language selector */}
          <div className="space-y-2">
            <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">Select Console Lang</span>
            <div className="grid grid-cols-3 gap-2">
              {[['en', 'EN'], ['es', 'ES'], ['fr', 'FR']].map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`py-1.5 px-2 border text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${
                    language === code
                      ? 'bg-white border-white text-black font-black'
                      : 'bg-neutral-900/60 border-neutral-850 text-neutral-550 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility toggle switches */}
          <div className="space-y-2 pt-4 border-t border-neutral-900">
            <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">Accessibility Profiles</span>
            <div className="space-y-2.5 p-3.5 bg-neutral-950 border border-neutral-900 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-350 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.wheelchair}
                  onChange={() => handleAccToggle('wheelchair')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Wheelchair Path (Sec. 112)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-350 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.stepFree}
                  onChange={() => handleAccToggle('stepFree')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Ramps / Elevator Guide</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-[10px] text-neutral-350 hover:text-white transition-all">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds.sensory}
                  onChange={() => handleAccToggle('sensory')}
                  className="w-3.5 h-3.5 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                />
                <span className="font-semibold uppercase tracking-wide">Sensory Room Info (Sec. 224C)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Global Feedback */}
        <button 
          onClick={() => setIsFeedbackOpen(true)}
          className="py-2.5 w-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-neutral-455 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-xl mt-4"
        >
          Submit Console Feedback
        </button>
      </div>
    );
  };

  const renderDashboardWidgets = () => {
    if (role === 'staff') {
      return (
        /* ================= OPERATIONS STAFF TELEMETRY ================= */
        <>
          {/* Global Density Vector Radar */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block font-bold">
                  GLOBAL DENSITY VECTOR
                </span>
                <h4 className="text-2xl font-black text-white">00:11:09</h4>
              </div>
              <span className="px-2 py-0.5 border border-emerald-900/50 bg-emerald-950/20 text-[8px] font-mono tracking-widest text-emerald-450 font-bold uppercase rounded-full">
                LIVE
              </span>
            </div>

            {/* SVG Radar Graphic Animation */}
            <div className="h-28 flex items-center justify-center relative">
              <svg className="w-24 h-24 text-neutral-850" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="80" y2="20" stroke="#a3a3a3" strokeWidth="1" className="origin-center animate-[spin_5s_linear_infinite]" />
              </svg>
              <div className="absolute text-[8px] font-mono tracking-widest text-neutral-500 bottom-1">
                <span>RADAR SWEEP ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-900/40">
              <div className="space-y-0.5">
                <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">ACTIVE UNITS</span>
                <span className="block text-xs font-black text-white">14,209</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">THREAT LEVEL</span>
                <span className="block text-xs font-black text-white text-rose-500">ALPHA-0</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">BUFFER ZONE</span>
                <span className="block text-xs font-black text-white">98.2%</span>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1 text-[8px] font-mono tracking-wider text-neutral-500 uppercase">
                <Shield className="h-3 w-3" /> VENUE_A1
              </div>
              <h5 className="font-extrabold text-sm text-white pt-1">MetLife Stadium</h5>
              <div className="pt-2">
                <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                  <span>CAPACITY</span>
                  <span className="text-white font-bold">75,000 / 82,500</span>
                </div>
                <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1">
                  <div className="w-[91%] h-full bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1 text-[8px] font-mono tracking-wider text-neutral-500 uppercase">
                <Signal className="h-3 w-3" /> COMMS_LINK
              </div>
              <h5 className="font-extrabold text-sm text-white pt-1">Neural Comms</h5>
              <div className="pt-2 flex items-center justify-between">
                <div className="flex gap-0.5 items-end">
                  <div className="w-0.5 h-1.5 bg-white"></div>
                  <div className="w-0.5 h-2.5 bg-white"></div>
                  <div className="w-0.5 h-3.5 bg-white"></div>
                  <div className="w-0.5 h-4.5 bg-white"></div>
                  <div className="w-0.5 h-5 bg-neutral-800"></div>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">SIGNAL STABILITY</span>
                  <span className="block text-xs font-black text-white">94%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BROADCAST ALERT */}
          <div className="space-y-3">
            {!showAddAlert ? (
              <button
                onClick={() => setShowAddAlert(true)}
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-[0.25em] text-xs transition-all duration-300 shadow-md rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="h-4.5 w-4.5 stroke-[3]" />
                BROADCAST ALERT
              </button>
            ) : (
              <form onSubmit={handleCreateAlert} className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-1.5">
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase font-bold">DISPATCH INCIDENT REPORT</span>
                  <button type="button" onClick={() => setShowAddAlert(false)} className="text-[10px] text-neutral-500 hover:text-white uppercase font-bold">✕ Close</button>
                </div>
                <input
                  type="text"
                  placeholder="Alert Title"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-900 text-white px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:border-neutral-700"
                  required
                />
                <textarea
                  placeholder="Bottleneck or incident details..."
                  value={newAlertDesc}
                  onChange={(e) => setNewAlertDesc(e.target.value)}
                  className="w-full bg-black border border-neutral-900 text-white p-2.5 text-xs rounded-lg h-16 resize-none focus:outline-none focus:border-neutral-700"
                ></textarea>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newAlertSeverity}
                    onChange={(e) => setNewAlertSeverity(e.target.value)}
                    className="bg-black border border-neutral-900 text-neutral-450 p-1.5 text-2xs rounded-lg focus:outline-none"
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                    <option value="critical">Critical Severity</option>
                  </select>
                  <select
                    value={newAlertZoneId}
                    onChange={(e) => setNewAlertZoneId(e.target.value)}
                    className="bg-black border border-neutral-900 text-neutral-450 p-1.5 text-2xs rounded-lg focus:outline-none"
                  >
                    <option value="">All Zones</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-white text-black font-black uppercase tracking-wider text-[10px] rounded-lg transition-all hover:bg-neutral-200"
                >
                  Publish Protocol Dispatch
                </button>
              </form>
            )}
          </div>

          {/* PRIORITY PROTOCOLS */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-4">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block font-bold border-b border-neutral-900 pb-2">
              PRIORITY PROTOCOLS ({activeAlerts.length})
            </span>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="space-y-3">
                  <div className="p-3.5 border border-neutral-900 bg-neutral-950/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-mono tracking-wider text-rose-500 uppercase font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-rose-500" /> IMMEDIATE INTERVENTION
                      </span>
                      <span className="text-[8px] font-mono text-neutral-600">T-MINUS 04:00</span>
                    </div>
                    <p className="text-[10px] text-neutral-300 leading-normal">
                      Crowd density at Sector 7G exceeds safe threshold. Dispatching Unit Echo-4.
                    </p>
                  </div>
                  <div className="p-3.5 border border-neutral-900 bg-neutral-950/80 rounded-xl space-y-2">
                    <span className="text-[8px] font-mono tracking-wider text-neutral-450 uppercase font-bold block">
                      RESOURCE ALLOCATION
                    </span>
                    <p className="text-[10px] text-neutral-300 leading-normal">
                      Redistributing aerial surveillance drones to cover Transit Hub B.
                    </p>
                  </div>
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3.5 border rounded-xl space-y-2.5 transition-all ${
                      alert.severity === 'critical'
                        ? 'bg-rose-950/10 border-rose-900/50 text-rose-200'
                        : alert.severity === 'high'
                          ? 'bg-amber-950/10 border-amber-900/40 text-amber-200'
                          : 'bg-neutral-950 border-neutral-900'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-mono font-bold tracking-widest uppercase">
                        {alert.severity} Incident
                      </span>
                      {alert.zone_name && (
                        <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase">
                          @ {alert.zone_name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-white">{alert.title}</h4>
                      <p className="text-[10px] text-neutral-450 leading-snug">{alert.description}</p>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-neutral-900/40">
                      {alert.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                          className="px-2 py-1 bg-black border border-neutral-800 text-[8px] font-extrabold uppercase tracking-wider text-neutral-300 rounded hover:text-white"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="px-2.5 py-1 bg-white text-black text-[8px] font-black uppercase tracking-wider rounded flex items-center gap-1"
                      >
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      );
    } else {
      return (
        /* ================= SPECTATOR/FAN TELEMETRY ================= */
        <>
          {/* Scoreboard */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center text-center">
              <div className="space-y-1 flex-1">
                <span className="block text-2xl font-black tracking-widest text-white">BRA</span>
                <span className="block text-[8px] font-mono tracking-widest text-neutral-500 uppercase">BRAZIL</span>
              </div>
              <div className="px-4 py-1.5 border border-neutral-900 bg-neutral-950 text-neutral-400 font-extrabold uppercase text-[10px] tracking-wider rounded-lg">
                VS
              </div>
              <div className="space-y-1 flex-1">
                <span className="block text-2xl font-black tracking-widest text-white">FRA</span>
                <span className="block text-[8px] font-mono tracking-widest text-neutral-500 uppercase">FRANCE</span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <span className="px-4 py-1.5 border border-neutral-900 bg-neutral-950 text-neutral-300 font-bold uppercase text-[9px] tracking-widest rounded-full">
                QUARTER-FINAL • LIVE 21'
              </span>
            </div>
          </div>

          {/* Access seat Box */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
              <div>
                <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">YOUR ACCESS</span>
                <h4 className="font-black text-base text-white mt-1">PREMIUM BOX 04</h4>
              </div>
              <div className="p-1.5 rounded border border-neutral-800 bg-neutral-950 text-neutral-450">
                <span className="font-bold font-mono text-[9px]">HB</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 px-2 border border-neutral-900/50 bg-neutral-950 rounded-lg">
                <span className="text-neutral-500 font-mono uppercase text-[9px]">Gate</span>
                <span className="text-white font-bold">E-14 Titanium</span>
              </div>
              <div className="flex justify-between py-1 px-2 border border-neutral-900/50 bg-neutral-950 rounded-lg">
                <span className="text-neutral-500 font-mono uppercase text-[9px]">Row</span>
                <span className="text-white font-bold">AA</span>
              </div>
              <div className="flex justify-between py-1 px-2 border border-neutral-900/50 bg-neutral-950 rounded-lg">
                <span className="text-neutral-500 font-mono uppercase text-[9px]">Security Hash</span>
                <span className="text-white font-bold font-mono text-[10px]">AWC26-00491-BFA</span>
              </div>
            </div>

            <button
              onClick={() => alert("Digital Ticket Access Granted. Verification complete.")}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-black uppercase tracking-wider text-[10px] rounded-lg transition-all duration-300"
            >
              VIEW TICKET →
            </button>
          </div>

          {/* Command updates alerts list */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-3">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block font-bold border-b border-neutral-900 pb-2">
              COMMAND UPDATES
            </span>

            <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-neutral-350 leading-relaxed pl-3 border-l-2 border-neutral-700">
                    VIP transport corridor B cleared for executive arrivals.
                  </div>
                  <div className="text-[10px] text-neutral-350 leading-relaxed pl-3 border-l-2 border-neutral-700">
                    Weather advisory: Overcast conditions expected for second half.
                  </div>
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className="text-[10px] text-neutral-300 leading-normal pl-3 border-l-2 border-rose-800 bg-neutral-950/50 py-1.5 pr-2 rounded-r-lg">
                    <span className="font-extrabold uppercase text-[8px] font-mono tracking-widest text-rose-450 block">{alert.title}</span>
                    {alert.description}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom match stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">POSSESSION</span>
              <div className="flex justify-between items-baseline">
                <span className="text-base font-black text-white">54%</span>
                <span className="text-[8px] font-mono text-neutral-550 font-bold">BRA</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1">
                <div className="w-[54%] h-full bg-white rounded-full"></div>
              </div>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">EXPECTED GOALS</span>
              <span className="block text-base font-black text-white leading-none">1.82</span>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-2.5">
                <div className="w-[72%] h-full bg-white rounded-full"></div>
              </div>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">CROWD VOLUME</span>
              <div className="flex justify-between items-baseline">
                <span className="text-base font-black text-white">104 dB</span>
                <span className="text-[7px] text-rose-500 font-extrabold tracking-widest uppercase animate-pulse">PEAK</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1">
                <div className="w-[85%] h-full bg-white rounded-full"></div>
              </div>
            </div>

            <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-4 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">NETWORK LATENCY</span>
              <span className="block text-base font-black text-white leading-none">2ms</span>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-2.5">
                <div className="w-[98%] h-full bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  const renderStadiumMapWidget = () => {
    return (
      <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
          <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block font-bold">
            {role === 'staff' ? 'ZONE_MAP_01' : 'STADIUM DYNAMICS'}
          </span>
          <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase">
            {role === 'staff' ? '40.8128° N, 74.0742° W' : 'LIVE HEATMAP'}
          </span>
        </div>
        
        {role !== 'staff' && (
          <div className="flex justify-between items-center bg-neutral-950 border border-neutral-900/60 p-2.5 rounded-lg mb-1">
            <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">Stadium Occupancy</span>
            <span className="text-xs font-black text-white">98.4%</span>
          </div>
        )}

        <div className="p-3 bg-black border border-neutral-900 rounded-xl">
          <StadiumMap
            zones={zones}
            pois={pois}
            alerts={alerts}
            language={language}
            onAskAboutZone={handleAskAboutZone}
            safetyLens={safetyLens}
          />
        </div>
      </div>
    );
  };

  if (!started) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-black text-white font-sans ${
      accessibilityEnabled ? 'accessibility-high-contrast text-lg' : ''
    }`}>
      
      {/* Inline Keyframe Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Top Console Navigation */}
      <Header 
        language={language} 
        onLogout={handleLogout} 
        toggleSidebar={toggleSidebar} 
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        safetyLens={safetyLens}
        setSafetyLens={setSafetyLens}
        isDemoMode={isDemoMode}
        toggleDemoMode={toggleDemoMode}
      />

      {/* Slide-out Sidebar Drawer Overlay (for Mobile & Tablet viewports) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          {/* Drawer Panel Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-950 border-r border-neutral-900 p-5 h-full z-50 animate-slideIn">
            {renderSidebarContents(true)}
          </div>
        </div>
      )}

      {/* Main Console Workspace Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto space-y-6 pb-24 md:pb-6">
        
        {/* Critical alert banner */}
        {activeAlerts.some(a => a.severity === 'critical') && (
          <div className="bg-rose-950/20 border border-rose-900 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
              <span className="text-[9px] font-mono tracking-widest uppercase font-extrabold">
                CRITICAL INTERVENTION REQUIRED: {activeAlerts.find(a => a.severity === 'critical')?.title}
              </span>
            </div>
          </div>
        )}

        {/* ================= LAPTOP/DESKTOP VIEWPORT LAYOUT (Large Screen Full-Screen Feature Views) ================= */}
        <div className="hidden lg:block h-[calc(100vh-140px)] min-h-[580px] w-full">
          
          {activeFeature === 'hero' && (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-8 animate-fadeIn max-w-4xl mx-auto text-center px-6">
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase block font-bold">
                  SECURITY PROTOCOL LEVEL 7
                </span>
                <h2 className="text-4xl sm:text-5xl tracking-wide text-white leading-tight font-sans">
                  <span className="font-black italic block sm:inline">Identify your role</span>{' '}
                  <span className="font-light text-neutral-500 block sm:inline">in the executive ecosystem.</span>
                </h2>
                <p className="text-xs text-neutral-500 max-w-xl mx-auto leading-relaxed">
                  Select your clearance level below to load the operational telemetries and command centers for ArenaMind-AI.
                </p>
              </div>

              {/* Role Card Grid */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl pt-2">
                {/* Fan Card */}
                <button
                  onClick={() => {
                    setRole('fan');
                    setActiveFeature('assistant');
                  }}
                  className="text-left p-5 transition-all duration-300 border bg-neutral-950/40 border-neutral-900 hover:border-neutral-700 rounded-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-neutral-900 border border-neutral-850 rounded text-neutral-450">
                      <Compass className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 border border-neutral-850 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-505 rounded-full font-bold uppercase">
                      LVL 1
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">Spectator/Fan</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">Access real-time match analytics and directions.</p>
                  </div>
                </button>

                {/* Volunteer Card */}
                <button
                  onClick={() => {
                    setRole('volunteer');
                    setActiveFeature('assistant');
                  }}
                  className="text-left p-5 transition-all duration-300 border bg-neutral-950/40 border-neutral-900 hover:border-neutral-700 rounded-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-neutral-900 border border-neutral-850 rounded text-neutral-450">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 border border-neutral-850 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-550 rounded-full font-bold uppercase">
                      LVL 2
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">Volunteer</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">Coordinate field operations and visitor assistance.</p>
                  </div>
                </button>

                {/* Staff Card */}
                <button
                  onClick={() => {
                    setRole('staff');
                    setActiveFeature('assistant');
                  }}
                  className="text-left p-5 transition-all duration-300 border bg-neutral-950/40 border-neutral-900 hover:border-neutral-700 rounded-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-neutral-900 border border-neutral-850 rounded text-neutral-450">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 border border-neutral-850 bg-neutral-900 text-[8px] font-mono tracking-widest text-neutral-550 rounded-full font-bold uppercase">
                      LVL 4
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">Operations/Staff</h4>
                    <p className="text-[10px] text-neutral-500 leading-normal">Tactical command, security status, and incident alerts.</p>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveFeature('assistant')}
                  className="px-8 py-3.5 bg-gradient-to-r from-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-200 text-black font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-md rounded-full"
                >
                  INITIALIZE COMMAND CONSOLE
                </button>
              </div>
            </div>
          )}

          {activeFeature === 'assistant' && (
            <div className="w-full h-full flex flex-col justify-between animate-fadeIn">
              <ChatAssistant
                role={role}
                language={language}
                accessibilityNeeds={accessibilityNeeds}
                sessionId={sessionId}
                setSessionId={setSessionId}
                prefillQuery={prefillQuery}
                clearPrefillQuery={() => setPrefillQuery('')}
                safetyLens={safetyLens}
              />
            </div>
          )}

          {activeFeature === 'map' && (
            <div className="w-full h-full grid grid-cols-12 gap-6 items-stretch animate-fadeIn">
              {/* Map (Col-Span-7) */}
              <div className="col-span-7 bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
                {renderStadiumMapWidget()}
              </div>

              {/* Telemetry (Col-Span-5) */}
              <div className="col-span-5 flex flex-col gap-5 overflow-y-auto pr-1">
                {renderDashboardWidgets()}
              </div>
            </div>
          )}

          {activeFeature === 'configs' && (
            <div className="w-full h-full grid grid-cols-3 gap-6 items-stretch animate-fadeIn">
              {/* Column 1: Roles */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase block font-bold border-b border-neutral-900 pb-1.5">ROLE AUTHORIZATION</span>
                  {/* Fan */}
                  <button
                    onClick={() => setRole('fan')}
                    className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                      role === 'fan' ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-850'
                    }`}
                  >
                    <div className="flex items-start gap-3 pr-2">
                      <div className={`p-1.5 rounded border ${
                        role === 'fan' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-550 border-neutral-855'
                      }`}>
                        <Compass className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">Spectator/Fan</h4>
                        <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 1 operational clearance.</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                      LVL 1
                    </span>
                  </button>

                  {/* Volunteer */}
                  <button
                    onClick={() => setRole('volunteer')}
                    className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                      role === 'volunteer' ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-850'
                    }`}
                  >
                    <div className="flex items-start gap-3 pr-2">
                      <div className={`p-1.5 rounded border ${
                        role === 'volunteer' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-550 border-neutral-855'
                      }`}>
                        <HeartHandshake className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">Volunteer</h4>
                        <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 2 task administration.</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                      LVL 2
                    </span>
                  </button>

                  {/* Staff */}
                  <button
                    onClick={() => setRole('staff')}
                    className={`w-full text-left p-3.5 transition-all duration-300 border flex justify-between items-start rounded-xl ${
                      role === 'staff' ? 'bg-neutral-950 border-neutral-600 ring-1 ring-neutral-600' : 'bg-neutral-950/25 border-neutral-900 hover:border-neutral-850'
                    }`}
                  >
                    <div className="flex items-start gap-3 pr-2">
                      <div className={`p-1.5 rounded border ${
                        role === 'staff' ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-550 border-neutral-855'
                      }`}>
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">Operations/Staff</h4>
                        <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">Level 4 full command.</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 border border-neutral-800 bg-neutral-900 text-[7px] font-mono tracking-widest text-neutral-500 rounded-full font-bold uppercase mt-0.5 flex-shrink-0">
                      LVL 4
                    </span>
                  </button>
                </div>
              </div>

              {/* Column 2: Language */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase block font-bold border-b border-neutral-900 pb-1.5">CONSOLE LANGUAGE</span>
                  <div className="grid grid-cols-1 gap-3">
                    {[['en', 'English Protocol'], ['es', 'Español Protocolo'], ['fr', 'Protocole Français']].map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => setLanguage(code)}
                        className={`py-3.5 px-4 border text-[10px] uppercase tracking-wider font-extrabold rounded-xl transition-all text-left ${
                          language === code
                            ? 'bg-white border-white text-black font-black'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-450 hover:text-white'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Accessibility */}
              <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase block font-bold border-b border-neutral-900 pb-1.5">ACCESSIBILITY PROFILE</span>
                  <div className="space-y-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-350 hover:text-white transition-all">
                      <input
                        type="checkbox"
                        checked={accessibilityNeeds.wheelchair}
                        onChange={() => handleAccToggle('wheelchair')}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                      />
                      <span className="font-semibold uppercase tracking-wide">Wheelchair Seating (Section 112)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-350 hover:text-white transition-all">
                      <input
                        type="checkbox"
                        checked={accessibilityNeeds.stepFree}
                        onChange={() => handleAccToggle('stepFree')}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                      />
                      <span className="font-semibold uppercase tracking-wide">Step-free Path (Elevators/Ramps)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-350 hover:text-white transition-all">
                      <input
                        type="checkbox"
                        checked={accessibilityNeeds.sensory}
                        onChange={() => handleAccToggle('sensory')}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-800 text-white focus:ring-transparent focus:ring-0"
                      />
                      <span className="font-semibold uppercase tracking-wide">Sensory Room Guide (Section 224C)</span>
                    </label>
                  </div>
                </div>

                {/* Accessibility Score panel */}
                <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono tracking-widest text-neutral-505 uppercase font-bold">Accessibility Index</span>
                    <span className="text-xs font-black text-emerald-400">{calculateAccessibilityScore()}%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${calculateAccessibilityScore()}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-neutral-900/60">
                    <span className="text-[7px] font-mono tracking-widest text-neutral-500 uppercase block font-bold">RECOM PROTOCOLS</span>
                    <ul className="text-[9px] text-neutral-405 space-y-1 list-disc pl-3 font-semibold">
                      {calculateAccessibilityScore() < 90 && (
                        <li>Enable Wheelchair Seating and Step-free Path filters to optimize routes.</li>
                      )}
                      {activeAlerts.some(a => a.zone_id === 'gate-4') && (
                        <li>Elevator lobby maintenance active: detour via Gate D step-free corridors.</li>
                      )}
                      <li>Keep ADA shuttle Loops (currently G) synchronized with train arrival vectors.</li>
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="py-3 w-full bg-neutral-900 hover:bg-neutral-855 border border-neutral-855 text-neutral-455 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-xl mt-4"
                >
                  Submit Console Feedback
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ================= TABLET VIEWPORT LAYOUT (Medium Screen 2-Column Grid) ================= */}
        <div className="hidden md:grid lg:hidden grid-cols-12 gap-6 items-stretch h-[calc(100vh-140px)] min-h-[600px] animate-fadeIn">
          
          {/* Column 1: Chat Assistant */}
          <section className="col-span-6 h-full flex flex-col">
            <ChatAssistant
              role={role}
              language={language}
              accessibilityNeeds={accessibilityNeeds}
              sessionId={sessionId}
              setSessionId={setSessionId}
              prefillQuery={prefillQuery}
              clearPrefillQuery={() => setPrefillQuery('')}
              safetyLens={safetyLens}
            />
          </section>

          {/* Column 2: Map & Dashboard Widgets */}
          <section className="col-span-6 flex flex-col gap-5 overflow-y-auto pr-1">
            {renderStadiumMapWidget()}
            {renderDashboardWidgets()}
          </section>
        </div>

        {/* ================= MOBILE VIEWPORT LAYOUT (Small Screen Tabbed View) ================= */}
        <div className="md:hidden flex flex-col flex-1 pb-10">
          
          {/* Settings tab panel overlay (if chosen from bottom tab bar) */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-fadeIn p-1">
              {renderSidebarContents(false)}
            </div>
          )}

          {/* Chat assistant panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-[65vh] min-h-[500px] animate-fadeIn">
              <ChatAssistant
                role={role}
                language={language}
                accessibilityNeeds={accessibilityNeeds}
                sessionId={sessionId}
                setSessionId={setSessionId}
                prefillQuery={prefillQuery}
                clearPrefillQuery={() => setPrefillQuery('')}
                safetyLens={safetyLens}
              />
            </div>
          )}

          {/* Interactive map panel */}
          {activeTab === 'map' && (
            <div className="space-y-4 animate-fadeIn p-1">
              {renderStadiumMapWidget()}
            </div>
          )}

          {/* Dashboard widgets panel */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-fadeIn p-1">
              {renderDashboardWidgets()}
            </div>
          )}

        </div>

      </main>

      {/* ================= MOBILE BOTTOM TAB NAVIGATION BAR ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-900 py-2 px-6 flex justify-between items-center z-40 shadow-lg">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'dashboard' ? 'bg-white text-black' : 'text-neutral-550 hover:text-neutral-300'
          }`}
          type="button"
        >
          <LayoutGrid className="h-5 w-5" />
        </button>

        {/* Tab 2: Map */}
        <button
          onClick={() => setActiveTab('map')}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'map' ? 'bg-white text-black' : 'text-neutral-550 hover:text-neutral-300'
          }`}
          type="button"
        >
          <MapIcon className="h-5 w-5" />
        </button>

        {/* Tab 3: Chat Assistant */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'chat' ? 'bg-white text-black' : 'text-neutral-550 hover:text-neutral-300'
          }`}
          type="button"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'settings' ? 'bg-white text-black' : 'text-neutral-550 hover:text-neutral-300'
          }`}
          type="button"
        >
          <Settings className="h-5 w-5" />
        </button>
      </nav>

      {/* Overall feedback modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        sessionId={sessionId}
        language={language}
      />

      {/* Floating Judge Demo Script Panel */}
      {isDemoMode && (
        <div className="fixed bottom-6 right-6 z-[100] w-80 bg-neutral-950 border border-cyan-900/60 rounded-xl p-4 shadow-2xl animate-slideIn">
          <div className="flex justify-between items-center border-b border-neutral-900 pb-2 mb-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400 font-black flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Judge Demo Script
            </span>
            <button 
              onClick={() => toggleDemoMode()} 
              className="text-[9px] font-mono text-neutral-500 hover:text-white uppercase"
            >
              ✕ Exit
            </button>
          </div>
          <div className="text-[10px] text-neutral-400 space-y-3 leading-relaxed">
            <p className="text-[9px] font-mono text-neutral-500 uppercase">Follow these steps to evaluate the stack:</p>
            
            <div className="space-y-1">
              <span className="font-extrabold text-white block">1. Fan Safe Routing:</span>
              <p>Type in the assistant box: *&quot;How do I reach the Premium Box avoiding the congested Gate B?&quot;* to verify dynamic bypass logic.</p>
            </div>
            
            <div className="space-y-1">
              <span className="font-extrabold text-white block">2. Safety Lens Overlay:</span>
              <p>Toggle **Safety Lens ON** in the header. Inspect the stadium map to view red warning grids on Gate B and glowing green exit corridors.</p>
            </div>

            <div className="space-y-1">
              <span className="font-extrabold text-white block">3. Tactical Alert Command:</span>
              <p>Go to **Ecosystem Configs** tab, authorize as **Operations Staff**, and publish or resolve alerts on the tactical board.</p>
            </div>

            <div className="space-y-1">
              <span className="font-extrabold text-white block">4. Accessibility Score:</span>
              <p>Check the configs tab. Toggle wheelchair access off/on to see the **Accessibility Index** and recommendation engine adjust live.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
