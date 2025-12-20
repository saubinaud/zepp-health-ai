import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; zeppEmail: string; zeppPassword: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  refreshZeppToken: () => api.post('/api/auth/refresh-zepp-token'),
};

export const dataAPI = {
  getDashboard: () => api.get('/api/data/dashboard'),
  getDaily: (date: string) => api.get(`/api/data/daily/${date}`),
  getHeartRate: (params?: { from?: string; to?: string; interval?: number }) =>
    api.get('/api/data/heart-rate', { params }),
  getSleep: (params?: { from?: string; to?: string }) =>
    api.get('/api/data/sleep', { params }),
  getStress: (params?: { from?: string; to?: string }) =>
    api.get('/api/data/stress', { params }),
  getSpO2: (params?: { from?: string; to?: string }) =>
    api.get('/api/data/spo2', { params }),
  getWorkouts: (params?: { limit?: number }) =>
    api.get('/api/data/workouts', { params }),
  syncData: (data?: { fromDate?: string; toDate?: string }) =>
    api.post('/api/data/sync', data),
};

export const aiAPI = {
  analyze: (data: {
    analysisType: 'daily' | 'weekly' | 'monthly' | 'custom';
    dateFrom?: string;
    dateTo?: string;
  }) => api.post('/api/ai/analyze', data),
  chat: (data: { question: string; dateFrom?: string; dateTo?: string }) =>
    api.post('/api/ai/chat', data),
  getHistory: (params?: { limit?: number }) =>
    api.get('/api/ai/history', { params }),
};

export const notificationsAPI = {
  getNotifications: (params?: { limit?: number; unreadOnly?: boolean }) =>
    api.get('/api/notifications', { params }),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

export default api;
