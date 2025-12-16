import { QueryClient } from '@tanstack/react-query';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //TODO: MPT-15677 Adjust chache and stale time after strategy settled
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchOnReconnect: true,  
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
