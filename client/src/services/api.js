import axios from 'axios';
import { mockStorage, initClientStorage } from './mockStorage.js';

// Initialize fallback client storage immediately
initClientStorage();

const api = axios.create({
  baseURL: '/api',
  timeout: 4000,
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
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('mosaic_token');
        localStorage.removeItem('mosaic_user');
      }
    }
    return Promise.reject(error);
  }
);

// Safe executor that falls back to client mock storage if backend is unavailable/static
const safeCall = async (apiFn, mockFn) => {
  try {
    return await apiFn();
  } catch (error) {
    // If backend is offline, unreachable, or 404 (static host), gracefully fallback to mockStorage
    if (!error.response || error.code === 'ERR_NETWORK' || error.response.status === 404 || error.code === 'ECONNABORTED') {
      try {
        const mockData = await mockFn();
        return { data: mockData, status: 200, statusText: 'OK' };
      } catch (mockErr) {
        throw { response: { data: { message: mockErr.message || 'Operation failed' } } };
      }
    }
    throw error;
  }
};

const getCurrentUserId = () => {
  const userStr = localStorage.getItem('mosaic_user');
  if (userStr) {
    try {
      return JSON.parse(userStr).id;
    } catch (e) {}
  }
  return 'usr_demo_1';
};

// AUTH
export const authAPI = {
  login: (credentials) =>
    safeCall(
      () => api.post('/auth/login', credentials),
      () => mockStorage.login(credentials)
    ),

  register: (userData) =>
    safeCall(
      () => api.post('/auth/register', userData),
      () => mockStorage.register(userData)
    ),

  getMe: () =>
    safeCall(
      () => api.get('/auth/me'),
      () => {
        const user = JSON.parse(localStorage.getItem('mosaic_user') || 'null');
        return { success: true, user };
      }
    ),

  forgotPassword: (email) =>
    safeCall(
      () => api.post('/auth/forgot-password', { email }),
      () => ({
        success: true,
        message: 'Password reset instructions generated',
        resetToken: `reset_${Date.now()}`,
      })
    ),

  resetPassword: (data) =>
    safeCall(
      () => api.post('/auth/reset-password', data),
      () => ({ success: true, message: 'Password has been updated' })
    ),
};

// PRODUCTS
export const productsAPI = {
  getProducts: (params) =>
    safeCall(
      () => api.get('/products', { params }),
      () => mockStorage.getProducts()
    ),
  getProductById: (id) => api.get(`/products/${id}`),
};

// JOURNEYS
export const journeysAPI = {
  getJourneys: () =>
    safeCall(
      () => api.get('/journeys'),
      () => mockStorage.getJourneys(getCurrentUserId())
    ),

  getJourneyById: (id) => api.get(`/journeys/${id}`),

  createJourney: (data) =>
    safeCall(
      () => api.post('/journeys', data),
      () => mockStorage.createJourney(getCurrentUserId(), data)
    ),

  updateJourney: (id, data) =>
    safeCall(
      () => api.patch(`/journeys/${id}`, data),
      () => mockStorage.updateJourney(id, data)
    ),

  deleteJourney: (id) =>
    safeCall(
      () => api.delete(`/journeys/${id}`),
      () => mockStorage.deleteJourney(id)
    ),
};

// CHECKINS
export const checkinsAPI = {
  submitCheckin: (formData) =>
    safeCall(
      () =>
        api.post('/checkins', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      () => mockStorage.submitCheckin(getCurrentUserId(), formData)
    ),

  getCheckins: (params) =>
    safeCall(
      () => api.get('/checkins', { params }),
      () => mockStorage.getCheckins(getCurrentUserId(), params)
    ),

  getCheckinById: (id) => api.get(`/checkins/${id}`),

  deleteCheckin: (id) =>
    safeCall(
      () => api.delete(`/checkins/${id}`),
      () => mockStorage.deleteCheckin(id)
    ),
};

// PHOTOS
export const photosAPI = {
  uploadPhoto: (formData) =>
    safeCall(
      () =>
        api.post('/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      () => mockStorage.submitCheckin(getCurrentUserId(), formData)
    ),

  getPhotos: (params) =>
    safeCall(
      () => api.get('/photos', { params }),
      () => mockStorage.getPhotos(getCurrentUserId(), params)
    ),

  deletePhoto: (id) =>
    safeCall(
      () => api.delete(`/photos/${id}`),
      () => mockStorage.deletePhoto(id)
    ),
};

// REFLECTIONS
export const reflectionsAPI = {
  submitReflection: (data) =>
    safeCall(
      () => api.post('/reflections', data),
      () => mockStorage.submitReflection(getCurrentUserId(), data)
    ),

  getReflections: (params) =>
    safeCall(
      () => api.get('/reflections', { params }),
      () => mockStorage.getReflections(getCurrentUserId(), params)
    ),

  getReflectionById: (id) => api.get(`/reflections/${id}`),
};

// NOTIFICATIONS
export const notificationsAPI = {
  getNotifications: () =>
    safeCall(
      () => api.get('/notifications'),
      () => mockStorage.getNotifications(getCurrentUserId())
    ),

  markAsRead: (id) =>
    safeCall(
      () => api.patch(`/notifications/${id}/read`),
      () => mockStorage.markAsRead(id)
    ),

  markAllAsRead: () =>
    safeCall(
      () => api.post('/notifications/mark-all-read'),
      () => mockStorage.markAllAsRead()
    ),

  checkReminders: () =>
    safeCall(
      () => api.post('/notifications/check-reminders'),
      () => ({ success: true, count: 0 })
    ),
};

// USER & PROFILE
export const userAPI = {
  getProfile: () =>
    safeCall(
      () => api.get('/users/profile'),
      () => {
        const user = JSON.parse(localStorage.getItem('mosaic_user') || 'null') || {
          id: 'usr_demo_1',
          name: 'Aanya Sharma',
          email: 'customer@mosaicwellness.com',
          role: 'user',
        };
        return {
          success: true,
          profile: {
            ...user,
            stats: { totalJourneys: 1, activeJourneys: 1, totalCheckins: 10, totalReflections: 1, totalPhotos: 2 },
          },
        };
      }
    ),

  updateProfile: (data) =>
    safeCall(
      () => api.patch('/users/profile', data),
      () => {
        const user = JSON.parse(localStorage.getItem('mosaic_user') || '{}');
        const updated = { ...user, ...data };
        localStorage.setItem('mosaic_user', JSON.stringify(updated));
        return { success: true, user: updated };
      }
    ),

  exportData: () =>
    safeCall(
      () =>
        api.get('/users/export', {
          responseType: 'blob',
        }),
      () => {
        const dummy = { customer: 'Be Bodywise User', exportedAt: new Date().toISOString() };
        return new Blob([JSON.stringify(dummy, null, 2)], { type: 'application/json' });
      }
    ),

  deleteAccount: () =>
    safeCall(
      () => api.delete('/users/account'),
      () => {
        localStorage.clear();
        return { success: true };
      }
    ),
};

// ADMIN
export const adminAPI = {
  getStats: () =>
    safeCall(
      () => api.get('/admin/stats'),
      () => mockStorage.getAdminStats()
    ),
};

export default api;
