// Client API service communicating with the Express backend
const BACKEND_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://tirumala-clg-attendence.onrender.com' : '');
const API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Teacher Auth
  async teacherLogin(teacherId, password) {
    const res = await fetch(`${API_BASE}/auth/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId, password })
    });
    return handleResponse(res);
  },

  async getTeachers() {
    const res = await fetch(`${API_BASE}/auth/teachers`);
    return handleResponse(res);
  },

  // Classes
  async getClasses(teacherId) {
    const url = teacherId ? `${API_BASE}/classes?teacherId=${encodeURIComponent(teacherId)}` : `${API_BASE}/classes`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getClassById(classId) {
    const res = await fetch(`${API_BASE}/classes/${classId}`);
    return handleResponse(res);
  },

  async createClass(payload) {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async updateClass(classId, payload) {
    const res = await fetch(`${API_BASE}/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async deleteClass(classId) {
    const res = await fetch(`${API_BASE}/classes/${classId}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Attendance
  async markAttendance(payload) {
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getClassAttendance(classId) {
    const res = await fetch(`${API_BASE}/attendance/class/${classId}`);
    return handleResponse(res);
  },

  async getAttendanceByDate(classId, date) {
    const res = await fetch(`${API_BASE}/attendance/class/${classId}/date/${date}`);
    return handleResponse(res);
  },

  async updateAttendance(id, payload) {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async deleteAttendance(id) {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async getClassMatrix(classId) {
    const res = await fetch(`${API_BASE}/attendance/class/${classId}/matrix`);
    return handleResponse(res);
  },

  // Student portal
  async getStudentSummary(rollNumber) {
    const res = await fetch(`${API_BASE}/student/${encodeURIComponent(rollNumber)}/summary`);
    return handleResponse(res);
  },

  // Demo seed reset
  async resetDemoData() {
    const res = await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
    return handleResponse(res);
  }
};
