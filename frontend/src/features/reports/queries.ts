import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient, downloadFile } from '@/lib/api-client';
import type { DonationReport, PaginatedResponse, ReportParams } from '@/types/api';
import type { Donation } from '@/types/api';

export const reportsKeys = {
  all: ['reports'] as const,
  donations: (params: ReportParams) => ['reports', 'donations', params] as const,
  donationsList: (params: ReportParams) => ['reports', 'donations-list', params] as const,
};

export function useDonationReportQuery(params: Omit<ReportParams, 'page' | 'pageSize'>) {
  return useQuery({
    queryKey: reportsKeys.donations(params),
    queryFn: () => apiClient.get<DonationReport>('/reports/donations', { ...params }),
  });
}

export function useReportDonationListQuery(params: ReportParams) {
  return useQuery({
    queryKey: reportsKeys.donationsList(params),
    queryFn: ({ signal }) =>
      apiClient.get<PaginatedResponse<Donation>>('/reports/donations/list', { ...params }, signal),
  });
}

/** Streams the matching donations as a CSV file. */
export function useExportDonationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { from?: string; to?: string; search?: string }) =>
      downloadFile('/reports/donations/export', { ...params }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsKeys.all }),
  });
}
