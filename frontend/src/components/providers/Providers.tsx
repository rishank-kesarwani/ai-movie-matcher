'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import { LoginRequiredModalProvider } from '../../context/LoginRequiredModalContext';
import { LoginRequiredModal } from '../auth/LoginRequiredModal';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoginRequiredModalProvider>
        <AuthProvider>
          {children}
          <LoginRequiredModal />
        </AuthProvider>
      </LoginRequiredModalProvider>
    </QueryClientProvider>
  );
}
