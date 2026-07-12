'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  useEffect(() => {
    // On mount, try to refresh the session if we have stored auth
    if (isAuthenticated) {
      refreshSession();
    }
  }, [isAuthenticated, refreshSession]);

  return <>{children}</>;
}
