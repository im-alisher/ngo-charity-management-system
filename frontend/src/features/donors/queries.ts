import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';

import { donorsApi, type DonorInput } from '@/features/donors/api';
import type { Donor, DonorListParams } from '@/types/api';

export const donorsKeys = {
  all: ['donors'] as const,
  list: (params: DonorListParams) => ['donors', 'list', params] as const,
  history: (id: string) => ['donors', 'history', id] as const,
};

export function useDonorsQuery(params: DonorListParams) {
  return useQuery({
    queryKey: donorsKeys.list(params),
    queryFn: ({ signal }) => donorsApi.list(params, signal),
    // Keeps the previous page on screen while the next one loads, so the
    // table does not flash empty on every page or filter change.
    placeholderData: keepPreviousData,
  });
}

export function useDonorHistoryQuery(donorId: string | null) {
  return useQuery({
    queryKey: donorsKeys.history(donorId ?? ''),
    queryFn: () => donorsApi.history(donorId as string),
    enabled: donorId !== null,
  });
}

export interface DonorMutationOptions {
  onSuccess?: (donor: Donor) => void;
}

function useInvalidateDonors() {
  const queryClient = useQueryClient();

  // Donor totals and dashboard tiles depend on the donor list, so both are
  // refreshed after any write.
  return () => queryClient.invalidateQueries({ queryKey: donorsKeys.all });
}

export function useCreateDonorMutation({ onSuccess }: DonorMutationOptions = {}) {
  const invalidate = useInvalidateDonors();

  return useMutation({
    mutationFn: (input: DonorInput) => donorsApi.create(input),
    onSuccess: (donor) => {
      toast.success('Donor created', `${donor.fullName} was added.`);
      invalidate();
      onSuccess?.(donor);
    },
    onError: (error) => toast.error('Could not create donor', error),
  });
}

export function useUpdateDonorMutation({ onSuccess }: DonorMutationOptions = {}) {
  const invalidate = useInvalidateDonors();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DonorInput }) => donorsApi.update(id, input),
    onSuccess: (donor) => {
      toast.success('Donor updated', `${donor.fullName} was saved.`);
      invalidate();
      onSuccess?.(donor);
    },
    onError: (error) => toast.error('Could not update donor', error),
  });
}

export function useDeleteDonorMutation(onSuccess?: () => void) {
  const invalidate = useInvalidateDonors();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => donorsApi.remove(id),
    onSuccess: (_result, id) => {
      toast.success('Donor deleted', 'The donor and their donations were removed.');
      // A deleted donor's history is no longer reachable.
      queryClient.removeQueries({ queryKey: donorsKeys.history(id) });
      invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error('Could not delete donor', error),
  });
}
