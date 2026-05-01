'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshSession } = useAuthStore();

  useEffect(() => {
    // On mount, try to refresh the session if we have stored auth
    if (isAuthenticated) {
      refreshSession();
    }
  }, []);

  return <>{children}</>;
}
