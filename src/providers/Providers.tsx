'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { ReleaseGuard } from '@/providers/ReleaseGuard';
import { Toaster } from 'sonner';
import { GlobalActivity } from '@/components/feedback/GlobalActivity';
import { MessageNotifications } from '@/components/feedback/MessageNotifications';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReleaseGuard />
      <Suspense fallback={null}>
        <GlobalActivity />
        <MessageNotifications />
      </Suspense>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
