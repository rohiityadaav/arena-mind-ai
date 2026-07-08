const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Debug logs requested
console.log("[FINAL_DEBUG] BASE_URL at runtime:", BASE_URL);

export async function getStadiumData() {
  const url = `${BASE_URL}/api/stadium`;
  console.log('[DEPLOY_DEBUG] Fetching stadium data from:', url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      let msg = `Stadium server returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error("[FINAL_DEBUG] getStadiumData error:", err);
    throw err;
  }
}

export async function getAlerts() {
  const url = `${BASE_URL}/api/alerts`;
  console.log('[DEPLOY_DEBUG] Fetching alerts from:', url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      let msg = `Alerts server returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error("[FINAL_DEBUG] getAlerts error:", err);
    throw err;
  }
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

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = 'chat_server_error';
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error("[FINAL_DEBUG] sendChatMessage error:", err, "BASE_URL:", BASE_URL);
    throw err;
  }
}

export async function createAlert(alertData) {
  const url = `${BASE_URL}/api/alerts`;
  console.log('[DEPLOY_DEBUG] Creating alert at:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) {
      let msg = `Alert creation returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error('[DEPLOY_DEBUG] createAlert failure:', err);
    throw err;
  }
}

export async function updateAlertStatus(id, status) {
  const url = `${BASE_URL}/api/alerts/${id}`;
  console.log('[DEPLOY_DEBUG] Updating alert status at:', url);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      let msg = `Alert update returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error('[DEPLOY_DEBUG] updateAlertStatus failure:', err);
    throw err;
  }
}

export async function deleteAlert(id) {
  const url = `${BASE_URL}/api/alerts/${id}`;
  console.log('[DEPLOY_DEBUG] Deleting alert at:', url);
  try {
    const res = await fetch(url, {
      method: 'DELETE',
    });
    if (!res.ok) {
      let msg = `Alert delete returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error('[DEPLOY_DEBUG] deleteAlert failure:', err);
    throw err;
  }
}

export async function submitFeedback(sessionId, rating, comment) {
  const url = `${BASE_URL}/api/feedback`;
  console.log('[DEPLOY_DEBUG] Submitting feedback to:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rating, comment }),
    });
    if (!res.ok) {
      let msg = `Feedback returned status ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error('[DEPLOY_DEBUG] submitFeedback failure:', err);
    throw err;
  }
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
