import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mosaic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear if it was a login attempt failure
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('mosaic_token');
        localStorage.removeItem('mosaic_user');
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// PRODUCTS
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
};

// JOURNEYS
export const journeysAPI = {
  getJourneys: () => api.get('/journeys'),
  getJourneyById: (id) => api.get(`/journeys/${id}`),
  createJourney: (data) => api.post('/journeys', data),
  updateJourney: (id, data) => api.patch(`/journeys/${id}`, data),
  deleteJourney: (id) => api.delete(`/journeys/${id}`),
};

// CHECKINS
export const checkinsAPI = {
  submitCheckin: (formData) =>
    api.post('/checkins', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getCheckins: (params) => api.get('/checkins', { params }),
  getCheckinById: (id) => api.get(`/checkins/${id}`),
  deleteCheckin: (id) => api.delete(`/checkins/${id}`),
};

// PHOTOS
export const photosAPI = {
  uploadPhoto: (formData) =>
    api.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPhotos: (params) => api.get('/photos', { params }),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
};

// REFLECTIONS
export const reflectionsAPI = {
  submitReflection: (data) => api.post('/reflections', data),
  getReflections: (params) => api.get('/reflections', { params }),
  getReflectionById: (id) => api.get(`/reflections/${id}`),
};

// NOTIFICATIONS
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  checkReminders: () => api.post('/notifications/check-reminders'),
};

// USER & PROFILE
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  exportData: () =>
    api.get('/users/export', {
      responseType: 'blob',
    }),
  deleteAccount: () => api.delete('/users/account'),
};

// ADMIN
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
