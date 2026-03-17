/**
 * @fileOverview React Query Configuration
 * 
 * Centralized TanStack Query client with production-optimized cache settings.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create configured query client for production.
 * 
 * Cache settings:
 * - staleTime: 30s — Data considered fresh for 30 seconds
 * - gcTime (formerly cacheTime): 5m — Keep unused queries cached for 5 minutes
 * - retry: 1 — Retry once on network errors
 * - refetchOnWindowFocus: false — Don't refetch on tab focus (explicit invalidation preferred)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
