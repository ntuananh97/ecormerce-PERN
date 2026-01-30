/**
 * Query Provider
 * Wraps the app with React Query's QueryClientProvider
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/react-query';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider Component
 * Provides React Query context to all child components
 * Creates a new QueryClient instance per user session (important for SSR)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance once per component lifecycle
  // This prevents sharing state between different users in SSR
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
