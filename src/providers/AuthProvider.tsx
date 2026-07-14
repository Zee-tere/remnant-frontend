'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const checkedStoredSession = useRef(false);

  useEffect(() => {
    if (!hasHydrated || checkedStoredSession.current) return;
    checkedStoredSession.current = true;
    if (isAuthenticated) refreshSession().catch(() => undefined);
  }, [hasHydrated, isAuthenticated, refreshSession]);

  return <>{children}</>;
}
