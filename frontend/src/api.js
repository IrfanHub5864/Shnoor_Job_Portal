import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const companyAPI = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  getDetails: (id) => api.get(`/companies/${id}/details`),
  updateStatus: (id, status) => api.put(`/companies/${id}/status`, { status }),
  approve: (id) => api.put(`/companies/${id}/approve`),
  reject: (id) => api.put(`/companies/${id}/reject`),
  block: (id) => api.put(`/companies/${id}/block`),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  block: (id) => api.put(`/users/${id}/block`),
  unblock: (id) => api.put(`/users/${id}/unblock`),
};

export const jobAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  updateStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const applicationAPI = {
  getAll: () => api.get('/applications'),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const subscriptionAPI = {
  getAll: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  updateStatus: (id, status) => api.put(`/subscriptions/${id}/status`, { status }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

export const logsAPI = {
  getAll: (filters = {}) => api.get('/logs', { params: filters }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (payload) => api.put('/settings', payload),
};

export default api;
