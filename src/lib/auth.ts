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

  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  refreshSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

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

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },

      refreshSession: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken && !refreshToken) return false;

        try {
          let currentAccessToken = accessToken;
          let user = null;

          if (currentAccessToken) {
            const profileRes = await fetch(`${getApiUrl()}/auth/me`, {
              headers: { Authorization: `Bearer ${currentAccessToken}` },
              cache: 'no-store',
            });
            if (profileRes.ok) user = await profileRes.json();
          }

          if (!user && refreshToken) {
            const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshed = await refreshRes.json();
              currentAccessToken = refreshed.accessToken;
              user = refreshed.user;
            }
          }

          if (!user || !currentAccessToken) {
            get().logout();
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
        } catch {
          get().logout();
          return false;
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
    },
  ),
);
