import { apiClient } from '@/lib/api-client';
import type {
  Beneficiary,
  BeneficiaryCategory,
  BeneficiaryListParams,
  BeneficiaryStatus,
  PaginatedResponse,
} from '@/types/api';

export interface BeneficiaryInput {
  fullName: string;
  phone?: string;
  category: BeneficiaryCategory;
  status: BeneficiaryStatus;
}

export const beneficiariesApi = {
  list(
    params: BeneficiaryListParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Beneficiary>> {
    return apiClient.get<PaginatedResponse<Beneficiary>>('/beneficiaries', { ...params }, signal);
  },

  get(id: string, signal?: AbortSignal): Promise<Beneficiary> {
    return apiClient.get<Beneficiary>(`/beneficiaries/${id}`, undefined, signal);
  },

  create(input: BeneficiaryInput): Promise<Beneficiary> {
    return apiClient.post<Beneficiary>('/beneficiaries', input);
  },

  update(id: string, input: BeneficiaryInput): Promise<Beneficiary> {
    return apiClient.patch<Beneficiary>(`/beneficiaries/${id}`, input);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/beneficiaries/${id}`);
  },
};
