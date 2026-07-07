import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import ChatAssistant from './components/ChatAssistant';
import StadiumMap from './components/StadiumMap';
import LiveStatus from './components/LiveStatus';
import Dashboard from './components/Dashboard';
import FeedbackModal from './components/FeedbackModal';
import { api } from './services/api';
import { MessageSquare, ShieldAlert, Award } from 'lucide-react';

export default function App() {
  const [started, setStarted] = useState(false);
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
  const [activeTab, setActiveTab] = useState('assistant'); // For mobile layout ('assistant', 'map', 'status')

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
    // Poll alerts every 5 seconds to simulate real-time updates
    const interval = setInterval(() => {
      refreshAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshAlerts = async () => {
    try {
      const activeAlerts = await api.getAlerts();
      setAlerts(activeAlerts);
      // Re-fetch zones to get updated crowd levels if alert status changed
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

  const toggleAccessibility = () => {
    setAccessibilityEnabled(!accessibilityEnabled);
    setAccessibilityNeeds(prev => ({
      wheelchair: !accessibilityEnabled,
      stepFree: !accessibilityEnabled,
      sensory: !accessibilityEnabled
    }));
  };

  const handleAskAboutZone = (zoneName) => {
    const query = language === 'es' 
      ? `¿Cómo llego a ${zoneName}?`
      : language === 'fr'
        ? `Comment puis-je me rendre à ${zoneName} ?`
        : `How do I reach ${zoneName}?`;
    
    setPrefillQuery(query);
    setActiveTab('assistant'); // Switch tab on mobile
  };

  // Return to landing page if not started
  if (!started) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${
      accessibilityEnabled ? 'accessibility-high-contrast text-lg' : ''
    }`}>
      
      {/* Navigation Header */}
      <Header
        role={role}
        language={language}
        accessibilityEnabled={accessibilityEnabled}
        setRole={setRole}
        setLanguage={setLanguage}
        toggleAccessibility={toggleAccessibility}
        onLogout={handleLogout}
      />

      {/* Main App Dashboard */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto space-y-6">
        
        {/* Urgent Global Alert Banner if there are high/critical alerts */}
        {alerts.some(a => a.severity === 'critical' && a.status !== 'resolved') && (
          <div className="bg-rose-950/20 border border-rose-900 text-rose-200 px-4 py-3 rounded-none flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                CRITICAL ALERT: {alerts.find(a => a.severity === 'critical' && a.status !== 'resolved')?.title} - 
                {alerts.find(a => a.severity === 'critical' && a.status !== 'resolved')?.description}
              </span>
            </div>
          </div>
        )}

        {/* Mobile Tab Selectors */}
        <div className="flex lg:hidden bg-neutral-950 p-1 border border-neutral-900 rounded-none">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-none transition-all ${
              activeTab === 'assistant' ? 'bg-white text-black' : 'text-neutral-500'
            }`}
          >
            Assistant
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-none transition-all ${
              activeTab === 'map' ? 'bg-white text-black' : 'text-neutral-500'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-none transition-all ${
              activeTab === 'status' ? 'bg-white text-black' : 'text-neutral-500'
            }`}
          >
            Status
          </button>
        </div>

        {/* Dynamic Grid Layout */}
        {role === 'staff' ? (
          /* ================= OPERATIONS STAFF VIEW ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chat Assistant (Always visible left side) */}
            <div className="lg:col-span-4 flex flex-col justify-between h-[650px] lg:h-[750px]">
              <ChatAssistant
                role={role}
                language={language}
                accessibilityNeeds={accessibilityNeeds}
                sessionId={sessionId}
                setSessionId={setSessionId}
                prefillQuery={prefillQuery}
                clearPrefillQuery={() => setPrefillQuery('')}
              />
              <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="mt-3 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-neutral-450 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Submit Overall Experience Feedback
              </button>
            </div>

            {/* Dashboard Controls & Live Map (Double column) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Dashboard metrics */}
              <Dashboard
                stadium={stadium}
                zones={zones}
                alerts={alerts}
                onRefreshAlerts={refreshAlerts}
                language={language}
              />
              
              {/* Combined live map panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 bg-black p-5 border border-neutral-900 rounded-none">
                  <StadiumMap
                    zones={zones}
                    pois={pois}
                    alerts={alerts}
                    language={language}
                    onAskAboutZone={handleAskAboutZone}
                  />
                </div>
                
                {/* General status cards for operators */}
                <div className="md:col-span-6 bg-black p-5 border border-neutral-900 rounded-none flex flex-col justify-between">
                  <LiveStatus
                    stadium={stadium}
                    alerts={alerts}
                    onRefreshAlerts={refreshAlerts}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= FANS & VOLUNTEERS VIEW ================= */
          <>
            {/* Desktop Layout Grid */}
            <div className="hidden lg:grid grid-cols-12 gap-6 h-[720px]">
              
              {/* Left Column: Chat Assistant */}
              <div className="col-span-4 flex flex-col h-full justify-between">
                <ChatAssistant
                  role={role}
                  language={language}
                  accessibilityNeeds={accessibilityNeeds}
                  sessionId={sessionId}
                  setSessionId={setSessionId}
                  prefillQuery={prefillQuery}
                  clearPrefillQuery={() => setPrefillQuery('')}
                />
                <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="mt-3 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-850 text-neutral-450 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                >
                  Submit Overall Experience Feedback
                </button>
              </div>

              {/* Center Column: Live Map */}
              <div className="col-span-5 bg-black p-5 border border-neutral-900 h-full flex flex-col justify-between rounded-none">
                <StadiumMap
                  zones={zones}
                  pois={pois}
                  alerts={alerts}
                  language={language}
                  onAskAboutZone={handleAskAboutZone}
                />
              </div>

              {/* Right Column: Live Status & Transit */}
              <div className="col-span-3 bg-black p-5 border border-neutral-900 h-full flex flex-col justify-between overflow-y-auto rounded-none">
                <LiveStatus
                  stadium={stadium}
                  alerts={alerts}
                  onRefreshAlerts={refreshAlerts}
                  language={language}
                />
              </div>
            </div>

            {/* Mobile Responsive Layout (Tabbed) */}
            <div className="lg:hidden">
              {activeTab === 'assistant' && (
                <div className="flex flex-col h-[550px]">
                  <ChatAssistant
                    role={role}
                    language={language}
                    accessibilityNeeds={accessibilityNeeds}
                    sessionId={sessionId}
                    setSessionId={setSessionId}
                    prefillQuery={prefillQuery}
                    clearPrefillQuery={() => setPrefillQuery('')}
                  />
                  <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    className="mt-3 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-450 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                  >
                    Submit Overall Experience Feedback
                  </button>
                </div>
              )}

              {activeTab === 'map' && (
                <div className="bg-black p-4 border border-neutral-900 rounded-none">
                  <StadiumMap
                    zones={zones}
                    pois={pois}
                    alerts={alerts}
                    language={language}
                    onAskAboutZone={handleAskAboutZone}
                  />
                </div>
              )}

              {activeTab === 'status' && (
                <div className="bg-black p-4 border border-neutral-900 rounded-none">
                  <LiveStatus
                    stadium={stadium}
                    alerts={alerts}
                    onRefreshAlerts={refreshAlerts}
                    language={language}
                  />
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {/* Global Overall Feedback Rating Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        sessionId={sessionId}
        language={language}
      />

    </div>
  );
}
