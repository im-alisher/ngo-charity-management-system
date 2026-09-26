import { apiClient } from '@/lib/api-client';
import type {
  Donor,
  DonorDonationHistoryItem,
  DonorListParams,
  PaginatedResponse,
} from '@/types/api';

export interface DonorInput {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const donorsApi = {
  list(params: DonorListParams, signal?: AbortSignal): Promise<PaginatedResponse<Donor>> {
    return apiClient.get<PaginatedResponse<Donor>>('/donors', { ...params }, signal);
  },

  get(id: string, signal?: AbortSignal): Promise<Donor> {
    return apiClient.get<Donor>(`/donors/${id}`, undefined, signal);
  },

  create(input: DonorInput): Promise<Donor> {
    return apiClient.post<Donor>('/donors', input);
  },

  update(id: string, input: DonorInput): Promise<Donor> {
    return apiClient.patch<Donor>(`/donors/${id}`, input);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/donors/${id}`);
  },

  history(id: string): Promise<DonorDonationHistoryItem[]> {
    return apiClient.get<DonorDonationHistoryItem[]>(`/donors/${id}/donations`);
  },
};
