import { QueryClient } from '@tanstack/react-query';

/**
 * Enterprise QueryClient configured with aggressive caching,
 * stale-while-revalidate policies, and intelligent retry behavior.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 5 minutes before becoming stale
      staleTime: 5 * 60 * 1000,
      // Unused query data is retained in garbage collection cache for 15 minutes
      gcTime: 15 * 60 * 1000,
      // Retry failed network queries once before displaying error
      retry: 1,
      // Prevent unexpected background network refetches on window focus for calm UI
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
