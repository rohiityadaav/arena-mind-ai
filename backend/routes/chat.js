const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { dbAll, dbRun, dbGet, generateUuid } = require('../database');
const rawGeminiKey = process.env.GEMINI_API_KEY || '';
const rawOpenAIKey = process.env.OPENAI_API_KEY || '';

// Helper to determine if key is configured with a real value vs placeholder template
const isKeyValid = (key) => {
  return key && key.trim() !== '' && !key.startsWith('<') && !key.includes('YOUR_') && !key.includes('REAL_KEY');
};

const apiKeyGemini = isKeyValid(rawGeminiKey) ? rawGeminiKey : '';
const apiKeyOpenAI = isKeyValid(rawOpenAIKey) ? rawOpenAIKey : '';

let genAI = null;
if (apiKeyGemini) {
  try {
    genAI = new GoogleGenerativeAI(apiKeyGemini);
    console.log('=========================================');
    console.log('ArenaMind-AI: [GEMINI] mode active.');
    console.log('=========================================');
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
} else if (apiKeyOpenAI) {
  console.log('=========================================');
  console.log('ArenaMind-AI: [OPENAI] mode active.');
  console.log('=========================================');
} else {
  console.log('=========================================');
  console.log('ArenaMind-AI: [LOCAL FALLBACK] mode active.');
  console.log('Running on rule-based routing engine.');
  console.log('=========================================');
}

// Helper to handle LLM calls (Gemini -> OpenAI -> Local Fallback)
const callLLM = async (systemPrompt) => {
  // 1. Try Gemini
  if (apiKeyGemini && genAI) {
    try {
      console.log('[CHAT_ROUTER] Routing query to Gemini (gemini-1.5-flash)...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 350
        }
      });
      
      const responseText = result.response.text();
      if (responseText && responseText.trim().length > 0) {
        console.log('[CHAT_ROUTER] Gemini completed successfully.');
        return responseText.trim();
      }
    } catch (geminiError) {
      console.error('[CHAT_ROUTER] Gemini API call failed:', geminiError.message);
    }
  }

  // 2. Try OpenAI Fallback
  if (apiKeyOpenAI) {
    try {
      console.log('[CHAT_ROUTER] Routing query to OpenAI (gpt-4o-mini)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyOpenAI}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.2,
          max_tokens: 350
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        if (responseText && responseText.trim().length > 0) {
          console.log('[CHAT_ROUTER] OpenAI completed successfully.');
          return responseText.trim();
        }
      } else {
        console.error('[CHAT_ROUTER] OpenAI API returned error status:', response.status, await response.text());
      }
    } catch (openaiError) {
      console.error('[CHAT_ROUTER] OpenAI API call failed:', openaiError.message);
    }
  }

  console.log('[CHAT_ROUTER] No LLM keys succeeded. Reverting to rule-based LOCAL engine.');
  return null;
};

// Local structured fallback dictionary for English, Spanish, and French
const structuredFallbacks = {
  en: {
    restroom: {
      title: "ACCESSIBLE SANITARY FACILITIES",
      route_steps: [
        "From Concourse level, locate Section 143 near East Escalators.",
        "Proceed clockwise past the First Aid station.",
        "Enter family restrooms equipped with automatic doors."
      ],
      warnings: "Standard restrooms at Section 312 are stairs-only.",
      recommended_zone: "Section 143 Restrooms",
      follow_up: "Would you like directions to the nearest elevator lobby?"
    },
    accessibility: {
      title: "PRIORITY STEP-FREE ROUTING",
      route_steps: [
        "Enter MetLife Stadium via Gate D priority lanes.",
        "Head straight toward the West Elevator Lobby.",
        "Take Elevator 3 to Level 1 Concourse, Section 112 is on your right."
      ],
      warnings: "Tactile guidance lines are active along this path.",
      recommended_zone: "Section 112 Wheelchair Deck",
      follow_up: "Do you need shuttle directions for post-match departure flows?"
    },
    routing: {
      title: "CROWD REDIRECT NOTICE",
      route_steps: [
        "Security queue at Gate B (East Entrance) is heavily congested.",
        "Fans arriving from Lot E/F should divert North to Gate A.",
        "Clearance wait times at Gate A are currently under 5 minutes."
      ],
      warnings: "⚠️ Congestion at Gate B is causing 25-minute delays.",
      recommended_zone: "Gate A (North Entrance)",
      follow_up: "Would you like navigation directions from Parking Lot E/F to Gate A?"
    },
    transport: {
      title: "ADA TRANSIT SHUTTLE SERVICE",
      route_steps: [
        "Exit Transit train station via the marked accessible ramp.",
        "Board the ADA Transit Shuttle vehicle.",
        "Dismount directly at Parking Lot G."
      ],
      warnings: "Shuttle loop is experiencing minor delays (approx. 10m).",
      recommended_zone: "Transit Shuttle Pick-up",
      follow_up: "Do you need assistance locating your vehicle in Lot G?"
    },
    sensory: {
      title: "SENSORY CALMING SUITE",
      route_steps: [
        "Proceed to Mid Concourse level 2.",
        "Locate Section 224C adjacent to the customer relations booth.",
        "Access quiet, noise-cancelling sensory room."
      ],
      warnings: "Sensory suite is currently open and staffed by volunteers.",
      recommended_zone: "Section 224C Sensory Room",
      follow_up: "Do you require noise-cancelling headphones or weighted vests?"
    },
    staff_info: {
      title: "STAFF OPERATIONAL STATUS REPORT",
      route_steps: [
        "Active incident at Gate B (congestion level 90%).",
        "Transit Shuttle delayed by 10 minutes.",
        "Ensure all safety staff are stationed at key elevator lobbies."
      ],
      warnings: "Review incident log on operations dashboard.",
      recommended_zone: "Gate B (East Entrance)",
      follow_up: "Do you need to issue a crowd redirect alert to fans?"
    },
    general: {
      title: "METLIFE COMMAND ASSISTANT",
      route_steps: [
        "Select your role (Fan, Volunteer, Staff).",
        "Ask about gate routes, accessible restrooms, or shuttle transit.",
        "Use the live interactive zone map to monitor bottlenecks."
      ],
      warnings: "All directions are advisory. Follow physical signs and staff.",
      recommended_zone: "Plaza Level Concourse",
      follow_up: "How can ArenaMind assist your stadium operations today?"
    }
  },
  es: {
    restroom: {
      title: "SERVICIOS SANITARIOS ACCESIBLES",
      route_steps: [
        "Desde el nivel del Concourse, ubique la Sección 143 cerca de las escaleras mecánicas del este.",
        "Continúe en el sentido de las agujas del reloj pasando la estación de primeros auxilios.",
        "Ingrese a los baños familiares equipados con puertas automáticas."
      ],
      warnings: "Los baños estándar en la Sección 312 son solo por escaleras.",
      recommended_zone: "Baños de la Sección 143",
      follow_up: "¿Le gustaría indicaciones para el vestíbulo de ascensores más cercano?"
    },
    accessibility: {
      title: "RUTA PRIORITARIA SIN ESCALONES",
      route_steps: [
        "Ingrese al MetLife Stadium por las líneas prioritarias de la Puerta D.",
        "Diríjase directamente hacia el vestíbulo del ascensor oeste.",
        "Tome el ascensor 3 hasta el Concourse del Nivel 1, la Sección 112 está a su derecha."
      ],
      warnings: "Las líneas de guía táctil están activas a lo largo de este camino.",
      recommended_zone: "Plaza de Sillas de Ruedas de la Sección 112",
      follow_up: "¿Necesita indicaciones del transbordo para la salida después del partido?"
    },
    routing: {
      title: "AVISO DE REDIRECCIÓN DE MULTITUD",
      route_steps: [
        "La fila de seguridad en la Puerta B (Entrada Este) está muy congestionada.",
        "Los aficionados que lleguen del Lote E/F deben desviarse hacia el norte a la Puerta A.",
        "Los tiempos de espera en la Puerta A son actualmente de menos de 5 minutos."
      ],
      warnings: "⚠️ La congestión en la Puerta B está causando retrasos de 25 minutos.",
      recommended_zone: "Puerta A (Entrada Norte)",
      follow_up: "¿Le gustaría indicaciones de navegación desde el Lote E/F hasta la Puerta A?"
    },
    transport: {
      title: "SERVICIO DE LANZADERA DE TRÁNSITO ADA",
      route_steps: [
        "Salga de la estación de tren de tránsito por la rampa accesible marcada.",
        "Aborde el vehículo de lanzadera de tránsito ADA dedicado.",
        "Descienda directamente en el Lote de Estacionamiento G."
      ],
      warnings: "El circuito de lanzaderas tiene retrasos menores (aprox. 10 minutos).",
      recommended_zone: "Punto de Recogida del Transbordo",
      follow_up: "¿Necesita ayuda para localizar su vehículo en el Lote G?"
    },
    sensory: {
      title: "SUITE SENSORIAL DE CALMA",
      route_steps: [
        "Proceda al nivel 2 del Mid Concourse.",
        "Ubique la Sección 224C al lado del puesto de atención al cliente.",
        "Acceda a la sala sensorial silenciosa e insonorizada."
      ],
      warnings: "La suite sensorial está abierta y atendida por voluntarios.",
      recommended_zone: "Sala Sensorial de la Sección 224C",
      follow_up: "¿Requiere auriculares con cancelación de ruido o chalecos con peso?"
    },
    staff_info: {
      title: "INFORME DE ESTADO OPERATIVO DEL PERSONAL",
      route_steps: [
        "Incidente activo en la Puerta B (nivel de congestión del 90%).",
        "El transbordo de tránsito se retrasó 10 minutos.",
        "Asegúrese de que el personal de seguridad esté apostado en los vestíbulos de ascensores."
      ],
      warnings: "Revise el registro de incidentes en el tablero de operaciones.",
      recommended_zone: "Puerta B (Entrada Este)",
      follow_up: "¿Necesita emitir una alerta de redirección de público a los aficionados?"
    },
    general: {
      title: "ASISTENTE DE MANDO ARENAMIND",
      route_steps: [
        "Seleccione su rol (Aficionado, Voluntario, Personal).",
        "Pregunte sobre rutas de puertas, baños accesibles o transbordos de tránsito.",
        "Use el mapa de zonas interactivo para monitorear embotellamientos."
      ],
      warnings: "Todas las indicaciones son de carácter consultivo. Siga las señales físicas.",
      recommended_zone: "Plaza Level Concourse",
      follow_up: "¿Cómo puede ArenaMind asistir a sus operaciones de estadio hoy?"
    }
  },
  fr: {
    restroom: {
      title: "SERVICES SANITAIRES ACCESSIBLES",
      route_steps: [
        "Depuis le niveau Concourse, situez la Section 143 près des escalators Est.",
        "Procédez dans le sens horaire en passant devant le poste de secours.",
        "Entrez dans les toilettes familiales équipées de portes automatiques."
      ],
      warnings: "Les toilettes standard de la Section 312 nécessitent des escaliers.",
      recommended_zone: "Toilettes de la Section 143",
      follow_up: "Souhaitez-vous obtenir l'itinéraire vers le hall d'ascenseurs le plus proche ?"
    },
    accessibility: {
      title: "ITINÉRAIRE PRIORITAIRE PMR SAN ESCALIERS",
      route_steps: [
        "Entrez dans le MetLife Stadium par les couloirs prioritaires de la Porte D.",
        "Dirigez-vous vers le hall d'ascenseurs Ouest.",
        "Prenez l'ascenseur 3 jusqu'au niveau 1, la Section 112 est à votre droite."
      ],
      warnings: "Les bandes de guidage tactiles sont actives sur ce parcours.",
      recommended_zone: "Plateforme Fauteuil Roulant Section 112",
      follow_up: "Avez-vous besoin d'itinéraires de navette pour le départ après-match ?"
    },
    routing: {
      title: "AVIS DE REDIRECTION DE FOULE",
      route_steps: [
        "La file d'attente à la Porte B (Entrée Est) est fortement encombrée.",
        "Les supporteurs arrivant du Parking E/F doivent bifurquer Nord vers la Porte A.",
        "Le temps d'attente à la Porte A est actuellement de moins de 5 minutes."
      ],
      warnings: "⚠️ L'encombrement à la Porte B cause 25 minutes de retard.",
      recommended_zone: "Porte A (Entrée Nord)",
      follow_up: "Souhaitez-vous un guidage depuis le Parking E/F vers la Porte A ?"
    },
    transport: {
      title: "SERVICE DE NAVETTES PMR / ADA",
      route_steps: [
        "Quittez la gare de transit par la rampe accessible balisée.",
        "Montez à bord de la navette PMR/ADA dédiée.",
        "Descendez directement au Parking G."
      ],
      warnings: "La navette subit actuellement un retard d'environ 10 minutes.",
      recommended_zone: "Navette Transit",
      follow_up: "Avez-vous besoin d'aide pour localiser votre véhicule dans le Parking G ?"
    },
    sensory: {
      title: "ESPACE SENSORIEL DE CALME",
      route_steps: [
        "Allez au niveau 2 du Mid Concourse.",
        "Trouvez la Section 224C à côté du stand relation client.",
        "Accédez à l'espace calme sensoriel insonorisé."
      ],
      warnings: "L'espace sensoriel est ouvert et géré par des bénévoles.",
      recommended_zone: "Espace Sensoriel Section 224C",
      follow_up: "Avez-vous besoin d'un casque anti-bruit ou d'un gilet lesté ?"
    },
    staff_info: {
      title: "RAPPORT DE SITUATION OPÉRATIONNELLE",
      route_steps: [
        "Incident actif à la Porte B (congestion de 90%).",
        "La navette de transit a 10 minutes de retard.",
        "Assurez-vous que les agents de sécurité sont postés aux ascenseurs."
      ],
      warnings: "Consultez le journal des incidents sur le tableau de bord.",
      recommended_zone: "Porte B (Entrée Est)",
      follow_up: "Devez-vous diffuser une alerte de redirection aux supporteurs ?"
    },
    general: {
      title: "ASSISTANT DE COMMANDEMENT ARENAMIND",
      route_steps: [
        "Sélectionnez votre rôle (Supporteur, Bénévole, Personnel).",
        "Demandez des infos sur les entrées, toilettes PMR ou navettes.",
        "Utilisez la carte de zone interactive pour surveiller les goulots."
      ],
      warnings: "Toutes les directions sont fournies à titre indicatif.",
      recommended_zone: "Plaza Level Concourse",
      follow_up: "Comment ArenaMind peut-il aider vos opérations aujourd'hui ?"
    }
  }
};

// POST send chat message
router.post('/', async (req, res) => {
  const { sessionId, message, role, language, accessibilityNeeds } = req.body;
  console.log("[CMD_DEBUG] /api/chat payload:", req.body);

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message is too long. Limit is 1000 characters.' });
  }

  const userRole = role || 'fan';
  const lang = language || 'en';

  if (!['fan', 'volunteer', 'staff'].includes(userRole)) {
    return res.status(400).json({ error: 'Invalid user role specified' });
  }

  if (!['en', 'es', 'fr'].includes(lang)) {
    return res.status(400).json({ error: 'Unsupported locale specified' });
  }

  const accNeeds = accessibilityNeeds || {};
  const isAccEnabled = accNeeds.wheelchair || accNeeds.stepFree || accNeeds.sensory || false;

  try {
    // 1. Get or Create Session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = generateUuid();
      const stadium = await dbGet('SELECT id FROM stadiums LIMIT 1');
      const stadiumId = stadium ? stadium.id : null;

      await dbRun(`
        INSERT INTO assistant_sessions (id, user_id, stadium_id, language)
        VALUES (?, null, ?, ?)
      `, [activeSessionId, stadiumId, lang]);
    }

    // 2. Save user message
    const userMsgId = generateUuid();
    await dbRun(`
      INSERT INTO assistant_messages (id, session_id, sender, message, created_at)
      VALUES (?, ?, 'user', ?, CURRENT_TIMESTAMP)
    `, [userMsgId, activeSessionId, message]);

    // 3. Gather Stadium Context from database
    const stadiumRaw = await dbGet('SELECT * FROM stadiums LIMIT 1');
    const stadium = stadiumRaw || { name: 'MetLife Stadium', city: 'East Rutherford', country: 'USA' };
    const zones = await dbAll('SELECT * FROM zones') || [];
    const pois = await dbAll('SELECT * FROM points_of_interest') || [];
    const alerts = await dbAll('SELECT * FROM alerts WHERE status != "resolved"') || [];
    const routes = await dbAll('SELECT * FROM routes') || [];

    // Detect Intent
    let intent = 'general';
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('bathroom') || lowerMsg.includes('restroom') || lowerMsg.includes('toilet') || lowerMsg.includes('baño') || lowerMsg.includes('toilettes') || lowerMsg.includes('wc')) {
      intent = 'restroom';
    } else if (lowerMsg.includes('wheelchair') || lowerMsg.includes('accessible') || lowerMsg.includes('step-free') || lowerMsg.includes('silla de ruedas') || lowerMsg.includes('fauteuil') || lowerMsg.includes('pmr') || lowerMsg.includes('rampa') || lowerMsg.includes('ascensor') || lowerMsg.includes('elevator')) {
      intent = 'accessibility';
    } else if (lowerMsg.includes('gate') || lowerMsg.includes('entrance') || lowerMsg.includes('puerta') || lowerMsg.includes('porte') || lowerMsg.includes('entrar')) {
      intent = 'routing';
    } else if (lowerMsg.includes('shuttle') || lowerMsg.includes('transit') || lowerMsg.includes('parking') || lowerMsg.includes('bus') || lowerMsg.includes('estacionamiento') || lowerMsg.includes('lote') || lowerMsg.includes('navette')) {
      intent = 'transport';
    } else if (lowerMsg.includes('sensory') || lowerMsg.includes('quiet') || lowerMsg.includes('calm') || lowerMsg.includes('sensorial') || lowerMsg.includes('calma') || lowerMsg.includes('sourd') || lowerMsg.includes('bruit')) {
      intent = 'sensory';
    } else if (userRole === 'staff' && (lowerMsg.includes('status') || lowerMsg.includes('alerts') || lowerMsg.includes('operational') || lowerMsg.includes('dashboard'))) {
      intent = 'staff_info';
    }

    let assistantResponse = '';
    let structuredData = null;

    // Compile context
    const contextStr = `
STADIUM DETAILS:
- Name: ${stadium.name} in ${stadium.city}, ${stadium.country}
- Elevators: East Gate Lobby, West Gate Lobby, Sections 109 and 226.
- Ramps: North Gate Ramp, South Gate Ramp.

STADIUM ZONES (with live crowd density %):
${zones.map(z => `- ${z.name} (Crowd Level: ${z.crowd_level}%, Accessibility Score: ${z.accessibility_score}/100)`).join('\n')}

POINTS OF INTEREST:
${pois.map(p => `- ${p.name} (Type: ${p.poi_type}, Accessible: ${p.is_accessible ? 'Yes' : 'No'}, Description: ${p.description})`).join('\n')}

ACTIVE OPERATIONAL ALERTS:
${alerts.map(a => `- [SEVERITY: ${a.severity.toUpperCase()}] ${a.title}: ${a.description} (Zone: ${a.zone_id ? zones.find(z => z.id === a.zone_id)?.name : 'All'})`).join('\n')}

PRE-CALCULATED ROUTING INFORMATION:
${routes.map(r => `- From "${r.from_point}" to "${r.to_point}": takes ${r.estimated_time_minutes} mins. Crowd Risk: ${r.crowd_risk_level}. Accessibility Notes: ${r.accessibility_notes}. Steps: ${r.route_data}`).join('\n')}
`;

    const systemPrompt = `
You are the ArenaMind-AI Operations Assistant for MetLife Stadium, supporting FIFA World Cup 2026.
You provide real-time, highly accurate, and action-oriented navigation, crowd-intelligence, and accessibility advice.

User Profile:
- Role: ${userRole.toUpperCase()} (fans want security updates/routes, volunteers need procedural help, staff need operational detail)
- Requested Response Language: ${lang}
- Accessibility Mode Active: ${isAccEnabled ? 'YES' : 'NO'}

Rules:
1. Provide short, concise, and structured responses (bullet points for steps). Keep descriptions brief.
2. If the user asks for route advice:
   - Check if any active alerts block the route. If there is congestion (like at Gate B), proactively warn them and suggest an alternative (e.g. Gate D or Gate A).
   - If Accessibility Mode is YES, prioritize step-free routing (using elevators/ramps, avoiding stairs, mentioning tactile lines if applicable).
3. Adjust tone based on role:
   - FANS: Warm, helpful, clear, and reassuring.
   - VOLUNTEERS: Professional, guide-oriented, providing service instructions.
   - STAFF: Direct, operations-focused, quoting details.
4. Reply strictly in the language code: ${lang}.
5. Avoid hallucinating facilities, directions, or elevators. Stick to the provided stadium context.
6. If the user's starting point is ambiguous, ask them to specify their gate, parking lot, or seat section.

STADIUM CONTEXT FOR THIS RUN:
${contextStr}

User Query: "${message}"
Assistant Response:`;

    // 4. Try LLM Call (Gemini -> OpenAI)
    assistantResponse = await callLLM(systemPrompt);

    // 5. Fallback logic if LLMs are not available or failed (Rules-Based Structured Fallback)
    if (!assistantResponse) {
      const activeDict = structuredFallbacks[lang] || structuredFallbacks.en;
      structuredData = activeDict[intent] || activeDict.general;
      
      // Build text backup response for backward compatibility
      assistantResponse = `**${structuredData.title}**\n\n` +
        structuredData.route_steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n') +
        `\n\n*${structuredData.warnings}*\n` +
        `Recommended Zone: **${structuredData.recommended_zone}**\n\n` +
        `_${structuredData.follow_up}_`;
    }

    // 6. Save assistant message
    const astMsgId = generateUuid();
    await dbRun(`
      INSERT INTO assistant_messages (id, session_id, sender, message, intent, created_at)
      VALUES (?, ?, 'assistant', ?, ?, CURRENT_TIMESTAMP)
    `, [astMsgId, activeSessionId, assistantResponse, intent]);

    const responsePayload = {
      sessionId: activeSessionId,
      intent,
      message: assistantResponse,
      structuredData: structuredData
    };
    console.log("[CMD_DEBUG] /api/chat response:", responsePayload);
    res.json(responsePayload);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
