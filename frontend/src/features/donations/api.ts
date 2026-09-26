import { apiClient } from '@/lib/api-client';
import type { Donation, DonationListParams, PaginatedResponse } from '@/types/api';

export interface DonationInput {
  donorId: string;
  amount: number;
  donationDate: string;
  notes?: string;
}

export const donationsApi = {
  list(params: DonationListParams, signal?: AbortSignal): Promise<PaginatedResponse<Donation>> {
    return apiClient.get<PaginatedResponse<Donation>>('/donations', { ...params }, signal);
  },

  get(id: string, signal?: AbortSignal): Promise<Donation> {
    return apiClient.get<Donation>(`/donations/${id}`, undefined, signal);
  },

  create(input: DonationInput): Promise<Donation> {
    return apiClient.post<Donation>('/donations', input);
  },

  update(id: string, input: DonationInput): Promise<Donation> {
    return apiClient.patch<Donation>(`/donations/${id}`, input);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/donations/${id}`);
  },
};
