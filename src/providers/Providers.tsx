'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ReleaseGuard } from '@/providers/ReleaseGuard';
import { Toaster } from 'sonner';
import { GlobalActivity } from '@/components/feedback/GlobalActivity';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReleaseGuard />
      <Suspense fallback={null}>
        <GlobalActivity />
      </Suspense>
      <SocketProvider>
        {children}
        <Toaster position="top-right" richColors />
      </SocketProvider>
    </AuthProvider>
  );
}
