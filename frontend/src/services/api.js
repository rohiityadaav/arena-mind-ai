const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Debug log the BASE_URL at runtime
console.log('[DEPLOY_DEBUG] API BASE_URL configured at:', BASE_URL || '(Vite Local Proxy)');

export async function getStadiumData() {
  const url = `${BASE_URL}/api/stadium`;
  console.log('[DEPLOY_DEBUG] Fetching stadium data from:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("stadium_server_error");
  return res.json();
}

export async function getAlerts() {
  const url = `${BASE_URL}/api/alerts`;
  console.log('[DEPLOY_DEBUG] Fetching alerts from:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("alerts_server_error");
  return res.json();
}

export async function sendChatMessage(sessionId, message, role, language, accessibilityNeeds) {
  const url = `${BASE_URL}/api/chat`;
  console.log('[DEPLOY_DEBUG] Posting chat message to:', url);
  
  // Support both single payload object argument and multiple arguments signature
  let payload = {};
  if (typeof sessionId === 'object' && sessionId !== null && message === undefined) {
    payload = sessionId;
  } else {
    payload = { sessionId, message, role, language, accessibilityNeeds };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("chat_server_error");
  return res.json();
}

export async function createAlert(alertData) {
  const url = `${BASE_URL}/api/alerts`;
  console.log('[DEPLOY_DEBUG] Creating alert at:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
  });
  if (!res.ok) throw new Error('alerts_server_error');
  return res.json();
}

export async function updateAlertStatus(id, status) {
  const url = `${BASE_URL}/api/alerts/${id}`;
  console.log('[DEPLOY_DEBUG] Updating alert status at:', url);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('alerts_server_error');
  return res.json();
}

export async function deleteAlert(id) {
  const url = `${BASE_URL}/api/alerts/${id}`;
  console.log('[DEPLOY_DEBUG] Deleting alert at:', url);
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('alerts_server_error');
  return res.json();
}

export async function submitFeedback(sessionId, rating, comment) {
  const url = `${BASE_URL}/api/feedback`;
  console.log('[DEPLOY_DEBUG] Submitting feedback to:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, rating, comment }),
  });
  if (!res.ok) throw new Error('feedback_server_error');
  return res.json();
}

// Bundle into default object export for backward compatibility with existing component imports
export const api = {
  getStadiumData,
  getAlerts,
  sendChatMessage,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  submitFeedback
};
