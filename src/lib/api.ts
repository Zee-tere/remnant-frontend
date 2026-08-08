import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from './auth';
import { getApiUrl } from './api-url';
import { beginActivity, endActivity } from './activity';

const api = axios.create({
  baseURL: getApiUrl(),
});

type RemnantRequestConfig = AxiosRequestConfig & {
  _background?: boolean;
};

function backgroundRequestConfig(): RemnantRequestConfig {
  return { _background: true };
}

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
    hasMore: payload.hasMore === true,
    nextCursor: typeof payload.nextCursor === 'string' ? payload.nextCursor : null,
  };
}

api.interceptors.request.use((config) => {
  const request = config as typeof config & {
    _activityId?: number;
    _background?: boolean;
  };
  if (!request._background) request._activityId = beginActivity();
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
  (response) => {
    endActivity((response.config as typeof response.config & { _activityId?: number })._activityId);
    return response;
  },
  async (error) => {
    const request = error.config as (typeof error.config & {
      _activityId?: number;
      _retriedAfterRefresh?: boolean;
      _transientRetryCount?: number;
    }) | undefined;
    endActivity(request?._activityId);
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
  getGuestContact: (id: string) =>
    api.get(`/listings/${id}/contact`).then((r) => r.data as { phone?: string; email?: string; telegram?: string }),
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
  getGuestManagement: (id: string, token: string) =>
    api.get(`/listings/${id}/guest-manage`, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
  updateGuestStatus: (id: string, token: string, status: 'PAUSED' | 'COMPLETED') =>
    api.patch(`/listings/${id}/guest-status`, { status }, { headers: { 'X-Guest-Token': token } }).then((r) => r.data),
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
  getConfig: () =>
    api.get('/auth/config', backgroundRequestConfig()).then((r) => r.data as {
      supabaseUrl: string | null;
      supabasePublishableKey: string | null;
      messagingRealtimeEnabled: boolean;
    }),
  createSupabaseToken: () =>
    api.post('/auth/supabase-token', undefined, backgroundRequestConfig()).then((r) => r.data as {
      accessToken: string;
      tokenType: 'Bearer';
      expiresIn: string;
      expiresAt: number;
    }),
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
  getDashboardSummary: () =>
    api.get('/users/me/summary').then((r) => r.data),
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

export const pairAlertsApi = {
  getAlerts: () =>
    api.get('/pair-alerts').then((r) => r.data),
  createAlert: (data: Record<string, unknown>) =>
    api.post('/pair-alerts', data).then((r) => r.data),
  updateAlert: (id: string, data: Record<string, unknown>) =>
    api.patch(`/pair-alerts/${id}`, data).then((r) => r.data),
  deleteAlert: (id: string) =>
    api.delete(`/pair-alerts/${id}`).then((r) => r.data),
  updateMatch: (id: string, status: 'VIEWED' | 'DISMISSED') =>
    api.patch(`/pair-alerts/matches/${id}`, { status }).then((r) => r.data),
};

export const conversationsApi = {
  getConversations: (background = false, limit = 30, cursor?: string) =>
    api.get(
      '/conversations',
      {
        params: { limit, ...(cursor ? { cursor } : {}) },
        ...(background ? backgroundRequestConfig() : {}),
      },
    ).then((r) => r.data),
  startConversation: (listingId: string) =>
    api.post('/conversations', { listingId }).then((r) => r.data),
  getMessages: (
    conversationId: string,
    options: { afterSequence?: number; beforeSequence?: number; limit?: number; background?: boolean } = {},
  ) =>
    api.get(
      `/conversations/${conversationId}/messages`,
      {
        params: {
          limit: options.limit ?? 50,
          ...(options.afterSequence !== undefined ? { afterSequence: options.afterSequence } : {}),
          ...(options.beforeSequence !== undefined ? { beforeSequence: options.beforeSequence } : {}),
        },
        ...(options.background ? backgroundRequestConfig() : {}),
      },
    ).then((r) => r.data),
  createMessage: (
    conversationId: string,
    content: string,
    type = 'TEXT',
    clientMessageId?: string,
  ) =>
    api.post(`/conversations/${conversationId}/messages`, {
      content,
      type,
      ...(clientMessageId ? { clientMessageId } : {}),
    }).then((r) => r.data),
  markAsRead: (conversationId: string, lastReadSequence?: number) =>
    api.patch(
      `/conversations/${conversationId}/read`,
      lastReadSequence === undefined ? {} : { lastReadSequence },
      backgroundRequestConfig(),
    ).then((r) => r.data),
  startGuestConversation: (data: { listingId: string; name: string; contact: string; offer: string }) =>
    api.post('/conversations/guest', data).then((r) => r.data),
  getGuestConversation: (conversationId: string, token: string, background = false) =>
    api.get(
      `/conversations/guest/${conversationId}`,
      {
        headers: { 'X-Guest-Token': token },
        ...(background ? backgroundRequestConfig() : {}),
      },
    ).then((r) => r.data),
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
      {
        headers: { 'X-Guest-Token': token },
        ...backgroundRequestConfig(),
      },
    ).then((r) => r.data),
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

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  getUsers: (params?: Record<string, string | number>) =>
    api.get('/admin/users', { params }).then((r) => r.data),
  updateUser: (id: string, data: { role?: string; bannedAt?: string | null }) =>
    api.patch(`/admin/users/${id}`, data).then((r) => r.data),
  messageUser: (id: string, message: string) =>
    api.post(`/admin/users/${id}/message`, { message }).then((r) => r.data),
  getListings: (params?: Record<string, string | number>) =>
    api.get('/admin/listings', { params }).then((r) => r.data),
  updateListingStatus: (id: string, status: string) =>
    api.patch(`/admin/listings/${id}`, { status }).then((r) => r.data),
  removeListing: (id: string) =>
    api.delete(`/admin/listings/${id}`).then((r) => r.data),
  getReports: (params?: Record<string, string | number>) =>
    api.get('/admin/reports', { params }).then((r) => r.data),
  actOnReport: (id: string, action: string, resolution?: string) =>
    api.post(`/admin/reports/${id}/action`, { action, resolution }).then((r) => r.data),
};

export default api;
