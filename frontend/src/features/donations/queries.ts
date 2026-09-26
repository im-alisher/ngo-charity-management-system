import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';

import { donationsApi, type DonationInput } from '@/features/donations/api';
import type { Donation, DonationListParams } from '@/types/api';

export const donationsKeys = {
  all: ['donations'] as const,
  list: (params: DonationListParams) => ['donations', 'list', params] as const,
};

export function useDonationsQuery(params: DonationListParams) {
  return useQuery({
    queryKey: donationsKeys.list(params),
    queryFn: ({ signal }) => donationsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateDonations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: donationsKeys.all });
}

export function useCreateDonationMutation(onSuccess?: (donation: Donation) => void) {
  const invalidate = useInvalidateDonations();

  return useMutation({
    mutationFn: (input: DonationInput) => donationsApi.create(input),
    onSuccess: (donation) => {
      toast.success('Donation recorded', 'The donation was added to the donor history.');
      invalidate();
      onSuccess?.(donation);
    },
    onError: (error) => toast.error('Could not record donation', error),
  });
}

export function useUpdateDonationMutation(onSuccess?: (donation: Donation) => void) {
  const invalidate = useInvalidateDonations();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DonationInput }) =>
      donationsApi.update(id, input),
    onSuccess: (donation) => {
      toast.success('Donation updated', 'The donation was saved.');
      invalidate();
      onSuccess?.(donation);
    },
    onError: (error) => toast.error('Could not update donation', error),
  });
}

export function useDeleteDonationMutation(onSuccess?: () => void) {
  const invalidate = useInvalidateDonations();

  return useMutation({
    mutationFn: (id: string) => donationsApi.remove(id),
    onSuccess: () => {
      toast.success('Donation deleted', 'The donation was removed.');
      invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error('Could not delete donation', error),
  });
}
