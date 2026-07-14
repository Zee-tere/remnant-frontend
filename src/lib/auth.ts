import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getApiUrl } from './api-url';

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

  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  logout: () => void;

  refreshSession: () => Promise<boolean>;
}

let sessionRefreshPromise: Promise<boolean> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set((state) => ({
          user,
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: true,
          isLoading: false,
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
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
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
      name: 'remnant-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
