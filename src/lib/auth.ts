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
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string) => void;
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
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      refreshSession: async () => {
        const { accessToken } = get();
        if (!accessToken) return false;

        try {
          const res = await fetch(`${getApiUrl()}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) {
            get().logout();
            return false;
          }

          const user = await res.json();
          set({
            user,
            accessToken,
            isAuthenticated: true,
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
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
