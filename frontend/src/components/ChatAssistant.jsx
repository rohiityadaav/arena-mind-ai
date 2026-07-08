import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { Send, Sparkles, Star, User, Compass, ShieldAlert } from 'lucide-react';

export default function ChatAssistant({ 
  role, 
  language, 
  accessibilityNeeds, 
  sessionId, 
  setSessionId, 
  prefillQuery, 
  clearPrefillQuery 
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

    const userMsg = { id: Math.random().toString(), sender: 'user', message: text };
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

      const assistantMsg = { 
        id: Math.random().toString(),
        sender: 'assistant', 
        message: response.message,
        intent: response.intent,
        structuredData: response.structuredData
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[DEPLOY_DEBUG] Chat request failed:', err);
      
      const isNetworkError = err.name === 'TypeError' || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('failed');
      let errorMsgText = '';
      
      if (isNetworkError) {
        if (language === 'es') {
          errorMsgText = 'El servidor de comando del estadio no está disponible temporalmente. Por favor, inténtelo de nuevo en un momento.';
        } else if (language === 'fr') {
          errorMsgText = 'Le serveur de commande du stade est temporairement indisponible. Veuillez réessayer dans un instant.';
        } else {
          errorMsgText = 'Stadium command server is temporarily unavailable. Please retry in a moment.';
        }
      } else {
        if (language === 'es') {
          errorMsgText = `El asistente de comando encontró un error de procesamiento: ${err.message}. Los sistemas de guía locales siguen en línea.`;
        } else if (language === 'fr') {
          errorMsgText = `L'assistant de commande a rencontré une erreur de traitement: ${err.message}. Les systèmes locaux restent en ligne.`;
        } else {
          errorMsgText = `The command assistant encountered a processing error: ${err.message}. Local guidance systems remain online.`;
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
        { label: "⚠️ Puerta B", query: "¿Está congestionada la puerta B y cuál es la alternativa?" },
        { label: "🚌 Lanzadera", query: "¿Qué horarios y demoras tiene el transbordo de tránsito?" }
      ];
    }
    if (language === 'fr') {
      return [
        { label: "♿ Accès PMR 112", query: "Je cherche un itinéraire PMR vers la Section 112" },
        { label: "🚽 Toilettes 143", query: "Où se trouvent les toilettes PMR près de la Section 143 ?" },
        { label: "🤫 Espace Calme", query: "Où est l'espace calme sensoriel ?" },
        { label: "⚠️ Porte B", query: "Est-ce que la porte B est encombrée ?" },
        { label: "🚌 Navette PMR", query: "Quel est le statut des navettes PMR ?" }
      ];
    }
    return [
      { label: "♿ Section 112 ADA", query: "I need a wheelchair-friendly route to Section 112 seating." },
      { label: "🚽 Section 143 WC", query: "Where is the closest accessible restroom near section 143?" },
      { label: "🤫 Sensory Room", query: "How do I reach the quiet sensory room?" },
      { label: "⚠️ Avoid Gate B", query: "Is Gate B congested and what is the best alternative?" },
      { label: "🚌 Shuttle Loop", query: "What are the transit shuttle pickup options and delays?" }
    ];
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/⚠️/g, '<span class="text-amber-500">⚠️</span>');
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc mt-1 text-[11px]" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      return <p key={i} className="mt-1.5 leading-relaxed text-[11px]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="flex flex-col h-[500px] md:h-full bg-black rounded-none border border-neutral-900 overflow-hidden">
      
      {/* Console Chat Header */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-neutral-800 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="console-header text-xs tracking-wider text-white">{t.chatTab}</h2>
            <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">SYS // ARENAMIND_BOT_V1</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
            <div className="p-3 border border-neutral-900 text-neutral-500">
              <Compass className="h-6 w-6 animate-float" />
            </div>
            <div>
              <h3 className="console-header text-xs tracking-wider text-white">{t.welcomeTitle}</h3>
              <p className="text-[10px] text-neutral-500 leading-relaxed mt-1">{t.welcomeSubtitle}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] flex items-start gap-2">
                {!isUser && (
                  <div className="p-1 border border-neutral-800 text-white mt-1 flex-shrink-0">
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`p-3 rounded-none text-xs border ${
                    isUser 
                      ? 'bg-white text-black border-white' 
                      : 'bg-neutral-950 text-neutral-300 border-neutral-900'
                  }`}>
                    {isUser ? (
                      msg.message
                    ) : msg.structuredData ? (
                      <div className="space-y-3 font-sans w-full max-w-sm text-left">
                        <div className="border-b border-neutral-900 pb-1.5 flex justify-between items-center gap-4">
                          <span className="console-header text-[9px] tracking-wider text-white font-bold uppercase">{msg.structuredData.title}</span>
                          <span className="px-1.5 py-0.5 border border-neutral-850 text-[8px] uppercase tracking-wider text-neutral-500 font-mono">
                            {msg.intent}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {msg.structuredData.route_steps.map((step, idx) => (
                            <div key={idx} className="flex gap-2 items-start text-[11px] text-neutral-300 leading-snug">
                              <span className="font-mono text-neutral-500 font-bold">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>

                        {msg.structuredData.warnings && (
                          <div className="p-2 border border-rose-950 bg-rose-950/20 text-rose-300 text-[10px] leading-relaxed uppercase tracking-wider font-mono">
                            {msg.structuredData.warnings}
                          </div>
                        )}

                        {msg.structuredData.recommended_zone && (
                          <div className="text-[10px] text-neutral-400 font-mono">
                            RECOMMENDED ZONE: <span className="text-white font-bold">{msg.structuredData.recommended_zone}</span>
                          </div>
                        )}

                        {msg.structuredData.follow_up && (
                          <div className="pt-2 border-t border-neutral-900 text-[10px] text-neutral-550 italic font-mono">
                            {msg.structuredData.follow_up}
                          </div>
                        )}
                      </div>
                    ) : (
                      formatText(msg.message)
                    )}
                  </div>

                  {/* Rating / Feedback inline block */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1">
                      {ratedMessages[msg.id] ? (
                        <span className="text-[9px] text-emerald-400 font-mono tracking-wider uppercase flex items-center gap-1">
                          ✓ RATED {ratedMessages[msg.id]}/5
                        </span>
                      ) : showFeedbackFor === msg.id ? (
                        <div className="bg-neutral-950 p-3 rounded-none border border-neutral-900 space-y-2 mt-2 w-60">
                          <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase block">{t.helpfulnessRating}</span>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(num => (
                              <button 
                                key={num} 
                                onClick={() => setRating(num)}
                                className="p-0.5"
                              >
                                <Star className={`h-4 w-4 ${rating >= num ? 'fill-white text-white' : 'text-neutral-700'}`} />
                              </button>
                            ))}
                          </div>
                          <input 
                            type="text" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t.feedbackCommentPlaceholder}
                            className="w-full bg-black border border-neutral-900 text-white p-1 text-[9px] rounded-none focus:outline-none focus:border-neutral-700"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => setShowFeedbackFor(null)}
                              className="px-2 py-0.5 text-[8px] uppercase tracking-wider bg-black border border-neutral-900 text-neutral-500 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleRatingSubmit(msg.id)}
                              className="px-2 py-0.5 text-[8px] uppercase tracking-wider bg-white text-black font-bold border border-white"
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
                          className="text-[9px] font-mono tracking-wider uppercase text-neutral-500 hover:text-white flex items-center gap-1 mt-1 transition-all"
                        >
                          <Star className="h-3 w-3" />
                          <span>{t.helpfulnessRating}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="p-1 border border-neutral-800 text-neutral-500 mt-1 flex-shrink-0">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-1 border border-neutral-800 text-white mt-1 flex-shrink-0 animate-pulse">
                <Sparkles className="h-3 w-3" />
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-none">
                <div className="flex space-x-1.5 items-center py-1 px-1">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-none animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-none animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-none animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick chips */}
      <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950/40 overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none">
        {getChips().map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="px-2.5 py-1 bg-black border border-neutral-900 hover:border-neutral-700 text-[9px] uppercase tracking-wider font-bold rounded-none text-neutral-400 hover:text-white transition-all"
            disabled={isLoading}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Console Chat Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-neutral-950 border-t border-neutral-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.inputPlaceholder}
          className="flex-1 bg-black border border-neutral-900 text-white px-3 py-2 text-xs rounded-none focus:outline-none focus:border-neutral-700 font-sans"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-white hover:bg-neutral-200 disabled:bg-neutral-950 disabled:border-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed border border-white text-black font-bold transition-all"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
