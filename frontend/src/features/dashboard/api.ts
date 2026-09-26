import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { DashboardOverview } from '@/types/api';

export const dashboardKeys = {
  overview: ['dashboard', 'overview'] as const,
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: ({ signal }) => apiClient.get<DashboardOverview>('/dashboard', undefined, signal),
  });
}
