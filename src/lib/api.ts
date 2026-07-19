import axios from 'axios';
import { useAuthStore } from './auth';
import { getApiUrl } from './api-url';

const api = axios.create({
  baseURL: getApiUrl(),
});

function normalizeListingPage(data: unknown) {
  const payload = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const listings = Array.isArray(payload.listings)
    ? payload.listings
    : Array.isArray(payload.items)
      ? payload.items
      : [];

  return {
    ...payload,
    listings,
    total: typeof payload.total === 'number' ? payload.total : listings.length,
    page: typeof payload.page === 'number' ? payload.page : 1,
    limit: typeof payload.limit === 'number' ? payload.limit : listings.length,
    totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
  };
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (typeof error.config & {
      _retriedAfterRefresh?: boolean;
      _transientRetryCount?: number;
    }) | undefined;
    const hadBearerToken = Boolean(request?.headers?.Authorization);

    const status = error.response?.status as number | undefined;
    const isTransientFailure = !status || [500, 502, 503, 504].includes(status);
    const isSafeToRetry = request?.method?.toLowerCase() === 'get';
    const retryCount = request?._transientRetryCount ?? 0;

    if (request && isSafeToRetry && isTransientFailure && retryCount < 2) {
      request._transientRetryCount = retryCount + 1;
      await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** retryCount));
      return api.request(request);
    }

    if (status === 401 && hadBearerToken && request && !request._retriedAfterRefresh) {
      request._retriedAfterRefresh = true;
      let refreshed = false;
      try {
        refreshed = await useAuthStore.getState().refreshSession();
      } catch {
        return Promise.reject(error);
      }
      const token = useAuthStore.getState().accessToken;
      if (refreshed && token) {
        request.headers.Authorization = `Bearer ${token}`;
        return api.request(request);
      }
    }

    if (status === 401 && hadBearerToken) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
    }

    return Promise.reject(error);
  },
);

export const listingsApi = {
  getListings: (params?: Record<string, string>) =>
    api.get('/listings', { params }).then((r) => normalizeListingPage(r.data)),
  getListing: (id: string) =>
    api.get(`/listings/${id}`).then((r) => r.data),
  getSimilarListings: (id: string, limit = 12) =>
    api.get(`/listings/${id}/similar`, { params: { limit } }).then((r) => r.data),
  searchListings: (params?: Record<string, string>) =>
    api.get('/listings/search', { params }).then((r) => r.data),
  getListingBySlug: (slug: string) =>
    api.get(`/listings/slug/${slug}`).then((r) => r.data),
  trackView: (id: string) =>
    api.post(`/listings/${id}/view`).then((r) => r.data),
  createListing: (data: Record<string, unknown>) =>
    api.post('/listings', data).then((r) => r.data),
  createGuestListing: (data: Record<string, unknown>) =>
    api.post('/listings/guest', data).then((r) => r.data),
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

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  confirmSignup: (data: { email: string; code: string }) =>
    api.post('/auth/confirm-signup', data).then((r) => r.data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (data: { email: string; code: string; password: string }) =>
    api.post('/auth/reset-password', data).then((r) => r.data),
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
  createMessage: (conversationId: string, content: string, type = 'TEXT') =>
    api.post(`/conversations/${conversationId}/messages`, { content, type }).then((r) => r.data),
  markAsRead: (conversationId: string) =>
    api.patch(`/conversations/${conversationId}/read`).then((r) => r.data),
  startGuestConversation: (data: { listingId: string; name: string; email: string; message: string }) =>
    api.post('/conversations/guest', data).then((r) => r.data),
  getGuestConversation: (conversationId: string, token: string) =>
    api.get(`/conversations/guest/${conversationId}`, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
  createGuestMessage: (conversationId: string, token: string, content: string, type = 'TEXT') =>
    api.post(
      `/conversations/guest/${conversationId}/messages`,
      { content, type },
      { headers: { 'X-Guest-Token': token } },
    ).then((r) => r.data),
  markGuestAsRead: (conversationId: string, token: string) =>
    api.patch(
      `/conversations/guest/${conversationId}/read`,
      undefined,
      { headers: { 'X-Guest-Token': token } },
    ).then((r) => r.data),
};

export const transactionsApi = {
  getConfig: () =>
    api.get('/transactions/config').then((r) => r.data as {
      paymentsEnabled: boolean;
      provider: 'paystack' | 'escrow' | null;
      guestCheckoutEnabled: boolean;
      currency: 'NGN';
    }),
  initiateTransaction: (listingId: string) =>
    api.post('/transactions', { listingId }).then((r) => r.data),
  initiateGuestTransaction: (data: { listingId: string; name: string; email: string }) =>
    api.post('/transactions/guest', data).then((r) => r.data),
  verifyPaystackTransaction: (reference: string) =>
    api.get(`/transactions/paystack/verify/${encodeURIComponent(reference)}`).then((r) => r.data),
  getGuestTransaction: (id: string, token: string) =>
    api.get(`/transactions/guest/${id}`, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
  confirmGuestReceipt: (id: string, token: string) =>
    api.patch(`/transactions/guest/${id}/confirm`, undefined, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
  disputeGuestTransaction: (id: string, token: string) =>
    api.post(`/transactions/guest/${id}/dispute`, undefined, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
  getTransactions: () =>
    api.get('/transactions').then((r) => r.data),
  getTransaction: (id: string) =>
    api.get(`/transactions/${id}`).then((r) => r.data),
  markShipped: (id: string, trackingInfo?: string) =>
    api.patch(`/transactions/${id}/ship`, { trackingInfo }).then((r) => r.data),
  fundStubTransaction: (id: string) =>
    api.post(`/transactions/${id}/stub-fund`).then((r) => r.data),
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
    const res = await api.post('/upload', formData);
    return res.data.url as string;
  },
  uploadGuestFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/guest', formData);
    return res.data.url as string;
  },
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await api.post('/upload/multiple', formData);
    return res.data.urls as string[];
  },
  uploadGuestMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await api.post('/upload/guest/multiple', formData);
    return res.data.urls as string[];
  },
};

export const reportsApi = {
  createReport: (targetType: string, targetId: string, reason: string) =>
    api.post('/reports', { targetType, targetId, reason }).then((r) => r.data),
};

export default api;
