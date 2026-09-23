// Management API service — only used from the admin panel
const API_BASE = '/api/management';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const managementApi = {
  // Login with admin credentials
  async login(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  // All requests below need admin token in header
  async getStats(token) {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  async getTeachers(token) {
    const res = await fetch(`${API_BASE}/teachers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  async createTeacher(token, payload) {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async updateTeacher(token, id, payload) {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async toggleTeacherStatus(token, id) {
    const res = await fetch(`${API_BASE}/teachers/${id}/toggle-status`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  async deleteTeacher(token, id) {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  }
};
