import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { getApiUrl } from './api-url';
import { readSessionValue, removeSessionValue, writeSessionValue } from './browser-storage';

export const AUTH_STORAGE_KEY = 'remnant-auth';
export const AUTH_LOGOUT_EVENT_KEY = 'remnant-auth-logout';
const AUTH_STORAGE_VERSION = 4;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  trustTier: 'NEW' | 'VERIFIED' | 'TRUSTED' | 'POWER';
  points: number;
  emailVerified: boolean;
  isPublicProfile: boolean;
  showStateOnProfile: boolean;
  deactivatedAt: string | null;
  deletionRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  sessionExpiresAt: number | null;

  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  logout: () => void;

  refreshSession: () => Promise<boolean>;
}

let sessionRefreshPromise: Promise<boolean> | null = null;

const sessionStorageAdapter: StateStorage = {
  getItem: readSessionValue,
  setItem: writeSessionValue,
  removeItem: removeSessionValue,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      sessionExpiresAt: null,

      setAuth: (user, accessToken) => {
        set(() => ({
          user,
          accessToken,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
        }));
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },

      logout: () => {
        const { accessToken } = get();
        void fetch(`${getApiUrl()}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accessToken ? { accessToken } : {}),
          keepalive: true,
          credentials: 'include',
        }).catch(() => undefined);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          sessionExpiresAt: null,
        });
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_LOGOUT_EVENT_KEY, String(Date.now()));
          const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('remnant-auth');
          channel?.postMessage({ type: 'logout' });
          channel?.close();
        }
      },

      refreshSession: async () => {
        if (sessionRefreshPromise) return sessionRefreshPromise;

        const { accessToken, isAuthenticated } = get();
        if (!accessToken && !isAuthenticated) return false;

        sessionRefreshPromise = (async () => {
          set({ isLoading: true });
          let currentAccessToken = accessToken;
          let user: User | null = null;
          let accessTokenRejected = false;

          if (currentAccessToken) {
            const profileRes = await fetch(`${getApiUrl()}/auth/me`, {
              headers: { Authorization: `Bearer ${currentAccessToken}` },
              cache: 'no-store',
            });
            if (profileRes.ok) user = await profileRes.json();
            else if (profileRes.status === 401 || profileRes.status === 403) accessTokenRejected = true;
            else throw new Error('Session validation is temporarily unavailable.');
          }

          if (!user && (accessTokenRejected || !currentAccessToken)) {
            const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: '{}',
              cache: 'no-store',
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const refreshed = await refreshRes.json();
              currentAccessToken = refreshed.accessToken;
              user = refreshed.user;
            } else if (refreshRes.status === 400 || refreshRes.status === 401 || refreshRes.status === 403) {
              get().logout();
              return false;
            } else {
              throw new Error('Session renewal is temporarily unavailable.');
            }
          }

          if (!user || !currentAccessToken) {
            if (accessTokenRejected) get().logout();
            else set({ isLoading: false });
            return false;
          }

          set({
            user,
            accessToken: currentAccessToken,
            refreshToken: null,
            isAuthenticated: true,
            isLoading: false,
            sessionExpiresAt: Date.now() + SESSION_DURATION_MS,
          });
          return true;
        })();

        try {
          return await sessionRefreshPromise;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        } finally {
          sessionRefreshPromise = null;
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: AUTH_STORAGE_VERSION,
      storage: createJSONStorage(() => sessionStorageAdapter),
      partialize: (state) => {
        const canRestore = Boolean(state.user && state.isAuthenticated);
        return {
          user: canRestore ? state.user : null,
          refreshToken: null,
          isAuthenticated: canRestore,
          sessionExpiresAt: canRestore ? state.sessionExpiresAt : null,
        };
      },
      migrate: () => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiresAt: null,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState>;
        const canRestore = Boolean(
          persisted.user &&
          persisted.isAuthenticated &&
          persisted.sessionExpiresAt &&
          persisted.sessionExpiresAt > Date.now(),
        );
        return {
          ...currentState,
          user: canRestore ? persisted.user ?? null : null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: canRestore,
          sessionExpiresAt: canRestore ? persisted.sessionExpiresAt ?? null : null,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.sessionExpiresAt && state.sessionExpiresAt <= Date.now()) state.logout();
        state?.setHasHydrated(true);
      },
    },
  ),
);
