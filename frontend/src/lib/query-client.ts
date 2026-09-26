import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';

/**
 * Shared React Query client.
 *
 * A 401 is never retried: the session is gone, so replaying the request would
 * only fail again. Transient network failures (`status === 0`) are retried
 * twice, since a brief blip should not surface as an error to the user.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.status === 0) return failureCount < 2;
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
