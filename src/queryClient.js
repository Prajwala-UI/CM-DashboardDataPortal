import { QueryClient } from '@tanstack/react-query';

// The Angular screens fetch fresh data on every visit and never retry, so caching and retries are off.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      staleTime: 0,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
