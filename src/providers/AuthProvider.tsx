'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AUTH_STORAGE_KEY, useAuthStore } from '@/lib/auth';

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
    const syncAuthAcrossTabs = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return;
      try {
        const incoming = event.newValue
          ? (JSON.parse(event.newValue) as { state?: { isAuthenticated?: boolean; refreshToken?: string | null } }).state
          : null;
        const current = useAuthStore.getState();
        if (
          incoming?.isAuthenticated === current.isAuthenticated &&
          incoming?.refreshToken === current.refreshToken
        ) {
          return;
        }
      } catch {
        // Rehydrate below if a previous app version wrote a different shape.
      }
      setCheckingStoredSession(true);
      Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
        const state = useAuthStore.getState();
        if (!state.isAuthenticated) {
          setCheckingStoredSession(false);
          return;
        }
        state.refreshSession().catch(() => undefined).finally(() => setCheckingStoredSession(false));
      });
    };
    window.addEventListener('storage', syncAuthAcrossTabs);
    return () => window.removeEventListener('storage', syncAuthAcrossTabs);
  }, []);

  if (!hasHydrated || checkingStoredSession) {
    return <div className="min-h-screen bg-[var(--background)]" aria-busy="true" />;
  }

  return <>{children}</>;
}
