/**
 * React Query Configuration
 * Centralized configuration for TanStack Query
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Default options for all queries
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Time before data is considered stale (5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Time before inactive queries are garbage collected (10 minutes)
    gcTime: 10 * 60 * 1000,
    
    // Retry failed requests 3 times
    retry: 3,
    
    // Don't refetch on window focus in development
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    
    // Refetch on reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
  },
};

/**
 * Create a new QueryClient instance
 * Should be called once per request in App Router
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Query Keys
 * Centralized query key factory for type safety and consistency
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.products.details(), id] as const,
  },
  
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.categories.details(), id] as const,
  },

  // Cart
  cart: {
    all: ['cart'] as const,
    me: () => [...queryKeys.cart.all, 'me'] as const,
  },
} as const;
