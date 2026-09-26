import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';

import { beneficiariesApi, type BeneficiaryInput } from '@/features/beneficiaries/api';
import type { Beneficiary, BeneficiaryListParams } from '@/types/api';

export const beneficiariesKeys = {
  all: ['beneficiaries'] as const,
  list: (params: BeneficiaryListParams) => ['beneficiaries', 'list', params] as const,
};

export function useBeneficiariesQuery(params: BeneficiaryListParams) {
  return useQuery({
    queryKey: beneficiariesKeys.list(params),
    queryFn: ({ signal }) => beneficiariesApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateBeneficiaries() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: beneficiariesKeys.all });
}

export function useCreateBeneficiaryMutation(onSuccess?: (beneficiary: Beneficiary) => void) {
  const invalidate = useInvalidateBeneficiaries();

  return useMutation({
    mutationFn: (input: BeneficiaryInput) => beneficiariesApi.create(input),
    onSuccess: (beneficiary) => {
      toast.success('Beneficiary created', `${beneficiary.fullName} was added.`);
      invalidate();
      onSuccess?.(beneficiary);
    },
    onError: (error) => toast.error('Could not create beneficiary', error),
  });
}

export function useUpdateBeneficiaryMutation(onSuccess?: (beneficiary: Beneficiary) => void) {
  const invalidate = useInvalidateBeneficiaries();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BeneficiaryInput }) =>
      beneficiariesApi.update(id, input),
    onSuccess: (beneficiary) => {
      toast.success('Beneficiary updated', `${beneficiary.fullName} was saved.`);
      invalidate();
      onSuccess?.(beneficiary);
    },
    onError: (error) => toast.error('Could not update beneficiary', error),
  });
}

export function useDeleteBeneficiaryMutation(onSuccess?: () => void) {
  const invalidate = useInvalidateBeneficiaries();

  return useMutation({
    mutationFn: (id: string) => beneficiariesApi.remove(id),
    onSuccess: () => {
      toast.success('Beneficiary deleted', 'The beneficiary record was removed.');
      invalidate();
      onSuccess?.();
    },
    onError: (error) => toast.error('Could not delete beneficiary', error),
  });
}
