'use client';

import React from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
        <Toaster position="top-right" richColors />
      </SocketProvider>
    </AuthProvider>
  );
}
