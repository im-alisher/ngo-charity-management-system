import { apiClient } from '@/lib/api-client';
import type { LoginResponse, User } from '@/types/api';

export const authApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  me(signal?: AbortSignal): Promise<User> {
    return apiClient.get<User>('/auth/me', undefined, signal);
  },
};
