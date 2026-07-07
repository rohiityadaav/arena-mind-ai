const BASE_URL = ''; // Proxied via Vite config in development

export const api = {
  async getStadiumData() {
    const response = await fetch(`${BASE_URL}/api/stadium`);
    if (!response.ok) throw new Error('Failed to load stadium data');
    return response.json();
  },

  async getAlerts() {
    const response = await fetch(`${BASE_URL}/api/alerts`);
    if (!response.ok) throw new Error('Failed to load alerts');
    return response.json();
  },

  async createAlert(alertData) {
    const response = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
    if (!response.ok) throw new Error('Failed to create alert');
    return response.json();
  },

  async updateAlertStatus(id, status) {
    const response = await fetch(`${BASE_URL}/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update alert');
    return response.json();
  },

  async deleteAlert(id) {
    const response = await fetch(`${BASE_URL}/api/alerts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete alert');
    return response.json();
  },

  async sendChatMessage(sessionId, message, role, language, accessibilityNeeds) {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message, role, language, accessibilityNeeds }),
    });
    if (!response.ok) throw new Error('Failed to get chat response');
    return response.json();
  },

  async submitFeedback(sessionId, rating, comment) {
    const response = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
};
