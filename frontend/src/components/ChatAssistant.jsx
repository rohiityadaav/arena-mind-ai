import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { Send, Star, User, Compass, ShieldAlert, Sparkles, Paperclip, ArrowUp } from 'lucide-react';

export default function ChatAssistant({ 
  role, 
  language, 
  accessibilityNeeds, 
  sessionId, 
  setSessionId, 
  prefillQuery, 
  clearPrefillQuery,
  safetyLens = false
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ratedMessages, setRatedMessages] = useState({});
  const [showFeedbackFor, setShowFeedbackFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const t = translations[language] || translations.en;
  const chatEndRef = useRef(null);

  // Initialize with system ready message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-message',
          sender: 'assistant',
          message: 'System ready. Command Center Assistant online. I have analyzed the current deployment status across all sectors. All systems are operating within nominal parameters. How can I assist your oversight today, Director?',
          timestamp: '09:42:01 UTC'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (prefillQuery) {
      handleSend(prefillQuery);
      clearPrefillQuery();
    }
  }, [prefillQuery]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    const userMsg = { 
      id: Math.random().toString(), 
      sender: 'user', 
      message: text 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(
        sessionId,
        text,
        role,
        language,
        accessibilityNeeds
      );

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      let finalMessage = response.message;
      let finalIntent = response.intent;
      let finalStructured = response.structuredData;

      if (safetyLens) {
        const lowerText = text.toLowerCase();
        let safetyAdvice = '';
        if (lowerText.includes('gate b') || lowerText.includes('congested') || lowerText.includes('crowd') || lowerText.includes('crowded')) {
          safetyAdvice = '\n\n🛡️ **SAFETY LENS NOTICE // REROUTING SUGGESTION**:\nHeavy congestion active at Gate B. We recommend executing a tactical bypass: exit via **Gate C (South)** or **Gate D (West)**. Active ADA shuttle loops are rerouted to bypass the Gate B choke point.';
        } else if (lowerText.includes('wheelchair') || lowerText.includes('accessible') || lowerText.includes('step-free') || lowerText.includes('ramp')) {
          safetyAdvice = '\n\n🛡️ **SAFETY LENS NOTICE // ACCESSIBILITY COMPLIANCE**:\nElevator 4 at Gate 4 concourse is currently undergoing maintenance. Use the step-free ramp at Gate D or transit shuttle Loop G (ADA) for safe, step-free access to Section 112.';
        } else {
          safetyAdvice = '\n\n🛡️ **SAFETY LENS NOTICE // CROWD HAZARD AWARENESS**:\nMultiple high-density sectors flagged. Safe assembly zones are located at **Gate C Plaza (South)**. Nearest operational First Aid center is positioned at **Section 110 (North Concourse)**.';
        }
        finalMessage += safetyAdvice;

        if (!finalStructured) {
          finalStructured = {
            cardType: 'warning',
            cardTitle: 'Tactical Safety Route Alert',
            warningLabel: 'SAFETY_ALERT // ACTIVE',
            warningTitle: 'Sector Gate B Congested & Section 112 Med Emergency',
            timeDelayLabel: 'BYPASS ENABLED',
            timeDelayValue: 'Safe Corridor Open',
            pathComplianceLabel: 'EMERGENCY PLAN ACTIVE',
            pillButtons: [
              { label: 'View Safe Exits Map', query: 'Show me safe exit paths' },
              { label: 'Locate Nearest First Aid', query: 'Where is the Section 110 Medical Point?' }
            ]
          };
          finalIntent = 'navigation';
        }
      }

      const assistantMsg = { 
        id: Math.random().toString(),
        sender: 'assistant', 
        message: finalMessage,
        intent: finalIntent,
        structuredData: finalStructured
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      console.error("[FINAL_DEBUG] sendChatMessage error:", err, "BASE_URL:", BASE_URL);
      console.error('[DEPLOY_DEBUG] Chat request failed:', err);

      const errMsg = (err.message || '').toLowerCase();
      const errName = err.name || '';
      const status = err.status || null;

      const isNetworkError =
        errName === 'TypeError' ||
        errMsg.includes('failed to fetch') ||
        errMsg.includes('networkerror') ||
        errMsg.includes('network error') ||
        errMsg.includes('cors') ||
        errMsg.includes('load failed');

      const isBackendError =
        errName === 'BackendError' ||
        (typeof status === 'number' && status >= 400 && status < 600);

      let errorMsgText = '';

      if (isNetworkError) {
        if (language === 'es') {
          errorMsgText = 'El servidor de comando del estadio no está disponible temporalmente. Por favor, inténtelo de nuevo en un momento.';
        } else if (language === 'fr') {
          errorMsgText = 'Le serveur de commande du stade est temporairement indisponible. Veuillez réessayer dans un instant.';
        } else {
          errorMsgText = 'Stadium command server is temporarily unavailable. Please retry in a moment.';
        }
      } else if (isBackendError) {
        if (language === 'es') {
          errorMsgText = `El asistente de comando encontró un error de procesamiento: ${err.message}. Los sistemas de guía locales siguen en línea.`;
        } else if (language === 'fr') {
          errorMsgText = `L'assistant de commande a rencontré une erreur de traitement: ${err.message}. Les systèmes locaux restent en ligne.`;
        } else {
          errorMsgText = `The command assistant encountered a processing error: ${err.message}. Local guidance systems remain online.`;
        }
      } else {
        if (language === 'es') {
          errorMsgText = `El asistente de comando encontró un error inesperado en el cliente: ${err.message}. Los sistemas de guía locales siguen en línea.`;
        } else if (language === 'fr') {
          errorMsgText = `L'assistant de commande a rencontré une erreur cliente inattendue: ${err.message}. Les systèmes locaux restent en ligne.`;
        } else {
          errorMsgText = `The command assistant encountered an unexpected client-side error: ${err.message}. Local guidance systems remain online.`;
        }
      }

      const errorMsg = { 
        id: Math.random().toString(), 
        sender: 'assistant', 
        message: errorMsgText
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async (msgId) => {
    try {
      await api.submitFeedback(sessionId, rating, comment);
      setRatedMessages(prev => ({ ...prev, [msgId]: rating }));
      setShowFeedbackFor(null);
      setComment('');
      alert(t.feedbackSuccess);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const getChips = () => {
    if (language === 'es') {
      return [
        { label: "♿ Sillas 112", query: "Necesito una ruta sin escalones a la Sección 112" },
        { label: "🚽 Baño 143", query: "¿Dónde está el baño accesible más cercano de la sección 143?" },
        { label: "🤫 Sala Silenciosa", query: "¿Cómo llego a la sala sensorial?" },
        { label: "⚠️ Puerta B", query: "¿Está congestionada la puerta B y cuál es la alternativa?" }
      ];
    }
    if (language === 'fr') {
      return [
        { label: "♿ Accès PMR 112", query: "Je cherche un itinéraire PMR vers la Section 112" },
        { label: "🚽 Toilettes 143", query: "Où se trouvent les toilettes PMR près de la Section 143 ?" },
        { label: "🤫 Espace Calme", query: "Où est l'espace calme sensoriel ?" },
        { label: "⚠️ Porte B", query: "Est-ce que la porte B est encombrée ?" }
      ];
    }
    return [
      { label: "♿ Section 112 ADA", query: "I need a wheelchair-friendly route to Section 112 seating." },
      { label: "🚽 Section 143 WC", query: "Where is the closest accessible restroom near section 143?" },
      { label: "🤫 Sensory Room", query: "How do I reach the quiet sensory room?" },
      { label: "⚠️ Avoid Gate B", query: "Is Gate B congested and what is the best alternative?" }
    ];
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/⚠️/g, '<span class="text-rose-500">⚠️</span>');
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc mt-1 text-[11px] text-neutral-300 leading-normal" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      return <p key={i} className="mt-1.5 leading-relaxed text-[11px] text-neutral-350" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  // Helper to resolve card values based on the intent
  const getCardDetails = (intent, data) => {
    const title = data.title || 'TELEMETRY DISPATCH';
    const warning = data.warnings || 'WARNING';

    if (intent === 'navigation' || intent === 'transport' || title.toLowerCase().includes('transit') || title.toLowerCase().includes('congestion')) {
      const isCongested = data.warnings && data.warnings.toLowerCase().includes('congest');
      return {
        cardTitle: title,
        warningLabel: warning,
        metric1Label: 'EST. DELAY',
        metric1Val: isCongested ? '+25m 00s' : '+4m 12s',
        metric2Label: 'REROUTE AVAILABILITY',
        metric2Val: '98%',
        colorClass: 'text-rose-400 border-rose-900/50 bg-rose-950/10'
      };
    } else if (intent === 'accessibility') {
      return {
        cardTitle: title,
        warningLabel: 'ACCESSIBLE',
        metric1Label: 'PATH LENGTH',
        metric1Val: '3 Sectors',
        metric2Label: 'ADA COMPLIANCE',
        metric2Val: '100%',
        colorClass: 'text-emerald-450 border-emerald-900/50 bg-emerald-950/10'
      };
    } else {
      return {
        cardTitle: title,
        warningLabel: 'OPERATIONAL',
        metric1Label: 'NEAREST HUB',
        metric1Val: data.recommended_zone || 'Sec. 143',
        metric2Label: 'ACCESS STATUS',
        metric2Val: 'SECURE',
        colorClass: 'text-neutral-300 border-neutral-800 bg-neutral-900/40'
      };
    }
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-xl border border-neutral-900 overflow-hidden flex-1">
      
      {/* Premium Screen Header */}
      <div className="px-5 py-4 border-b border-neutral-900 flex items-center justify-between bg-black">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black tracking-widest text-white uppercase font-sans">
            Command Center Assistant
          </h2>
          <p className="text-[8px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
            SECURE CHANNEL ALPHA-V
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase">SYS ONLINE</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-black">
        
        {/* Session badge */}
        <div className="flex justify-center my-2">
          <span className="px-4 py-1.5 rounded-full border border-neutral-900 bg-neutral-950/80 text-[8px] font-mono tracking-widest text-neutral-500 uppercase">
            SESSION INITIATED — 09:42:01 UTC
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar Icon box */}
                <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-1">
                  {isUser ? (
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  )}
                </div>

                {/* Message Bubble Card */}
                <div className="space-y-1.5 w-full">
                  <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-4 space-y-3 shadow-md w-full">
                    
                    {/* User / Assistant content */}
                    {isUser ? (
                      <p className="text-xs text-neutral-200 leading-relaxed font-sans">{msg.message}</p>
                    ) : msg.structuredData ? (
                      <div className="space-y-3 font-sans w-full text-left">
                        {/* Normal text summary above card */}
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          Diagnostic complete. Security perimeter is 100% operational. However, I have detected a minor deviation in Transit Route Alpha-2 due to increased pedestrian density at Gate 4.
                        </p>

                        {/* TRANSIT ANOMALY WARNING CARD */}
                        {(() => {
                          const card = getCardDetails(msg.intent, msg.structuredData);
                          return (
                            <div className={`p-4 border rounded-xl space-y-3 ${card.colorClass}`}>
                              {/* Title / Warning row */}
                              <div className="flex justify-between items-center border-b border-neutral-900/60 pb-2">
                                <span className="text-[10px] font-black tracking-wider uppercase">{card.cardTitle}</span>
                                <span className="px-2 py-0.5 border border-rose-900/80 bg-rose-950/40 text-[8px] font-mono tracking-widest text-rose-300 font-bold uppercase rounded-full">
                                  {card.warningLabel}
                                </span>
                              </div>

                              {/* Metrics columns */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">{card.metric1Label}</span>
                                  <span className="block text-xl font-black text-white leading-none">{card.metric1Val}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[8px] font-mono tracking-wider text-neutral-500 uppercase">{card.metric2Label}</span>
                                  <span className="block text-xl font-black text-white leading-none">{card.metric2Val}</span>
                                </div>
                              </div>

                              {/* Progress bar line */}
                              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                                <div className="w-[98%] h-full bg-white rounded-full"></div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Follow up text */}
                        {msg.structuredData.follow_up && (
                          <div className="pt-1.5 text-[11px] text-neutral-450 italic">
                            {msg.structuredData.follow_up}
                          </div>
                        )}
                      </div>
                    ) : (
                      formatText(msg.message)
                    )}

                    {/* Bubble Signature Signoff */}
                    <div className="flex justify-end pt-1 border-t border-neutral-900/50">
                      <span className="text-[8px] font-mono tracking-widest text-neutral-600 uppercase">
                        {isUser ? 'DIR_CMD // ENCRYPTED' : 'STATION_AI // SYNC_COMPLETE'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Helpfulness Rating */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1">
                      {ratedMessages[msg.id] ? (
                        <span className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase flex items-center gap-1 font-bold">
                          ✓ RATED {ratedMessages[msg.id]}/5
                        </span>
                      ) : showFeedbackFor === msg.id ? (
                        <div className="bg-neutral-950 border border-neutral-900 p-3 rounded-xl space-y-2 mt-2 w-60">
                          <span className="text-[8px] font-mono tracking-wider text-neutral-500 uppercase block font-bold">Helpfulness Rating</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setRating(num)}
                                className="p-0.5"
                                type="button"
                              >
                                <Star className={`h-4.5 w-4.5 ${rating >= num ? 'fill-white text-white' : 'text-neutral-800'}`} />
                              </button>
                            ))}
                          </div>
                          <input 
                            type="text" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t.feedbackCommentPlaceholder}
                            className="w-full bg-black border border-neutral-900 text-white px-2 py-1.5 text-[10px] rounded-lg focus:outline-none focus:border-neutral-700"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => setShowFeedbackFor(null)}
                              className="px-2.5 py-1 text-[8px] uppercase tracking-wider bg-black border border-neutral-900 text-neutral-500 hover:text-white rounded-lg"
                              type="button"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleRatingSubmit(msg.id)}
                              className="px-2.5 py-1 text-[8px] uppercase tracking-wider bg-white text-black font-black border border-white rounded-lg"
                              type="button"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setShowFeedbackFor(msg.id);
                            setRating(5);
                          }}
                          className="text-[8px] font-mono tracking-wider uppercase text-neutral-500 hover:text-white flex items-center gap-1 mt-1 transition-all"
                          type="button"
                        >
                          <Star className="h-3 w-3" />
                          <span>Helpfulness Rating</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
              </div>
              <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-4 shadow-md">
                <div className="flex space-x-1.5 items-center py-1 px-1">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick action chips */}
      <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950/40 overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none">
        {getChips().map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="px-3 py-1.5 bg-black border border-neutral-900 hover:border-neutral-700 text-[9px] uppercase tracking-wider font-extrabold rounded-full text-neutral-450 hover:text-white transition-all duration-300"
            disabled={isLoading}
            type="button"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Reroute pill buttons above input field as in screenshot */}
      <div className="px-5 py-2 flex gap-2 bg-black border-t border-neutral-900">
        <button 
          onClick={() => handleSend("Authorize secondary logistics protocol to reroute")}
          className="px-3.5 py-1.5 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 text-[9px] font-black uppercase tracking-wider text-white rounded-full transition-all duration-300"
          type="button"
        >
          Authorize Reroute
        </button>
        <button 
          onClick={() => handleSend("Initiate full sector diagnostic scan")}
          className="px-3.5 py-1.5 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 text-[9px] font-black uppercase tracking-wider text-white rounded-full transition-all duration-300"
          type="button"
        >
          Full Sector Scan
        </button>
      </div>

      {/* Console Chat Input styled exactly like the pill container in Image 1 */}
      <div className="p-4 bg-black border-t border-neutral-900 space-y-2">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 bg-neutral-950 border border-neutral-850 px-4 py-2.5 rounded-full shadow-inner focus-within:border-neutral-700 transition-all"
        >
          <Paperclip className="h-4.5 w-4.5 text-neutral-500 cursor-pointer hover:text-white transition-all flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue direct command..."
            className="flex-1 bg-transparent text-white px-0.5 py-0 text-xs rounded-none focus:outline-none placeholder-neutral-600 font-sans"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-1.5 bg-white hover:bg-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-750 disabled:cursor-not-allowed border border-transparent text-black font-black transition-all rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
        
        {/* Encryption Label */}
        <span className="block text-center text-[8px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
          EXECUTIVE ACCESS GRADE 7 // ENCRYPTED END-TO-END
        </span>
      </div>
    </div>
  );
}
