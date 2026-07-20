import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { getApiUrl } from './api-url';

export const AUTH_STORAGE_KEY = 'remnant-auth';
const AUTH_STORAGE_VERSION = 3;
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

const crossTabStorage: StateStorage = {
  getItem: (name) => {
    const persisted = window.localStorage.getItem(name);
    if (persisted) return persisted;

    const previousTabSession = window.sessionStorage.getItem(name);
    if (previousTabSession) {
      window.localStorage.setItem(name, previousTabSession);
      window.sessionStorage.removeItem(name);
    }
    return previousTabSession;
  },
  setItem: (name, value) => {
    window.localStorage.setItem(name, value);
    window.sessionStorage.removeItem(name);
  },
  removeItem: (name) => {
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
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

      setAuth: (user, accessToken, refreshToken) => {
        set((state) => ({
          user,
          accessToken,
          refreshToken:
            refreshToken ?? (state.user?.id === user.id ? state.refreshToken : null),
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
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          sessionExpiresAt: null,
        });
      },

      refreshSession: async () => {
        if (sessionRefreshPromise) return sessionRefreshPromise;

        const { accessToken, refreshToken } = get();
        if (!accessToken && !refreshToken) return false;

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

          if (!user && refreshToken && (accessTokenRejected || !currentAccessToken)) {
            const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
              cache: 'no-store',
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
            refreshToken,
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
      storage: createJSONStorage(() => crossTabStorage),
      partialize: (state) => {
        const canRestore = Boolean(state.user && state.refreshToken && state.isAuthenticated);
        return {
          user: canRestore ? state.user : null,
          refreshToken: canRestore ? state.refreshToken : null,
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
          persisted.refreshToken &&
          persisted.isAuthenticated &&
          persisted.sessionExpiresAt &&
          persisted.sessionExpiresAt > Date.now(),
        );
        return {
          ...currentState,
          user: canRestore ? persisted.user ?? null : null,
          accessToken: null,
          refreshToken: canRestore ? persisted.refreshToken ?? null : null,
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
