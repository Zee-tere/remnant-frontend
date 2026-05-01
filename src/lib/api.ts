import axios from 'axios';
import { useAuthStore } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach Bearer Token ──────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Auto-Refresh on 401 ─────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const success = await useAuthStore.getState().refreshSession();
        if (success) {
          const newToken = useAuthStore.getState().accessToken;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(error, null);
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── API Functions ──────────────────────────────────────

export const listingsApi = {
  getListings: (params?: Record<string, string>) =>
    api.get('/listings', { params }).then((r) => r.data),
  getListing: (id: string) =>
    api.get(`/listings/${id}`).then((r) => r.data),
  getListingBySlug: (slug: string) =>
    api.get(`/listings/slug/${slug}`).then((r) => r.data),
  createListing: (data: Record<string, unknown>) =>
    api.post('/listings', data).then((r) => r.data),
  updateListing: (id: string, data: Record<string, unknown>) =>
    api.patch(`/listings/${id}`, data).then((r) => r.data),
  deleteListing: (id: string) =>
    api.delete(`/listings/${id}`).then((r) => r.data),
  getMyListings: () =>
    api.get('/listings/my').then((r) => r.data),
  saveListing: (id: string) =>
    api.post(`/listings/${id}/save`).then((r) => r.data),
  unsaveListing: (id: string) =>
    api.delete(`/listings/${id}/save`).then((r) => r.data),
  getSavedListings: () =>
    api.get('/listings/saved').then((r) => r.data),
};

export const userApi = {
  getMe: () =>
    api.get('/users/me').then((r) => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    api.put('/users/me', data).then((r) => r.data),
  getUserById: (id: string) =>
    api.get(`/users/${id}`).then((r) => r.data),
  getAchievements: () =>
    api.get('/users/me/achievements').then((r) => r.data),
  getUserReviews: (id: string) =>
    api.get(`/users/${id}/reviews`).then((r) => r.data),
};

export const matchesApi = {
  getMatches: () =>
    api.get('/matches').then((r) => r.data),
  updateMatchStatus: (id: string, status: string) =>
    api.patch(`/matches/${id}`, { status }).then((r) => r.data),
};

export const conversationsApi = {
  getConversations: () =>
    api.get('/conversations').then((r) => r.data),
  startConversation: (listingId: string) =>
    api.post('/conversations', { listingId }).then((r) => r.data),
  getMessages: (conversationId: string) =>
    api.get(`/conversations/${conversationId}/messages`).then((r) => r.data),
  markAsRead: (conversationId: string) =>
    api.post(`/conversations/${conversationId}/read`).then((r) => r.data),
};

export const transactionsApi = {
  initiateTransaction: (listingId: string) =>
    api.post('/transactions', { listingId }).then((r) => r.data),
  getTransactions: () =>
    api.get('/transactions').then((r) => r.data),
  getTransaction: (id: string) =>
    api.get(`/transactions/${id}`).then((r) => r.data),
  markShipped: (id: string, trackingInfo?: string) =>
    api.patch(`/transactions/${id}/ship`, { trackingInfo }).then((r) => r.data),
  confirmReceipt: (id: string) =>
    api.patch(`/transactions/${id}/confirm`).then((r) => r.data),
  disputeTransaction: (id: string) =>
    api.post(`/transactions/${id}/dispute`).then((r) => r.data),
};

export const reviewsApi = {
  submitReview: (transactionId: string, rating: number, comment?: string) =>
    api.post('/reviews', { transactionId, rating, comment }).then((r) => r.data),
};

export const notificationsApi = {
  getNotifications: (page = 1) =>
    api.get('/notifications', { params: { page } }).then((r) => r.data),
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url as string;
  },
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.urls as string[];
  },
};

export const reportsApi = {
  createReport: (targetType: string, targetId: string, reason: string) =>
    api.post('/reports', { targetType, targetId, reason }).then((r) => r.data),
};

export default api;
