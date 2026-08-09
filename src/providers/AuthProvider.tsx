'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AUTH_LOGOUT_EVENT_KEY, useAuthStore } from '@/lib/auth';
import { LoadingState } from '@/components/feedback/LoadingState';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const checkedStoredSession = useRef(false);
  const [checkingStoredSession, setCheckingStoredSession] = useState(true);

  useEffect(() => {
    if (useAuthStore.getState().hasHydrated) return;
    let active = true;
    Promise.resolve(useAuthStore.persist.rehydrate())
      .catch(() => undefined)
      .finally(() => {
        if (active && !useAuthStore.getState().hasHydrated) setHasHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated || checkedStoredSession.current) return;
    checkedStoredSession.current = true;
    if (!isAuthenticated) {
      setCheckingStoredSession(false);
      return;
    }
    refreshSession().catch(() => undefined).finally(() => setCheckingStoredSession(false));
  }, [hasHydrated, isAuthenticated, refreshSession]);

  useEffect(() => {
    const clearThisTab = () => {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiresAt: null,
      });
    };
    const syncLogoutAcrossTabs = (event: StorageEvent) => {
      if (event.key === AUTH_LOGOUT_EVENT_KEY) clearThisTab();
    };
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('remnant-auth');
    const handleBroadcast = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'logout') clearThisTab();
    };
    channel?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', syncLogoutAcrossTabs);
    return () => {
      channel?.removeEventListener('message', handleBroadcast);
      channel?.close();
      window.removeEventListener('storage', syncLogoutAcrossTabs);
    };
  }, []);

  if (!hasHydrated || checkingStoredSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5">
        <LoadingState
          label={hasHydrated ? 'Restoring your session' : 'Preparing Remnant'}
          className="min-h-0"
        />
      </div>
    );
  }

  return <>{children}</>;
}
