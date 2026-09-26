import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import {
  useCreateBeneficiaryMutation,
  useUpdateBeneficiaryMutation,
} from '@/features/beneficiaries/queries';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/format';
import {
  BENEFICIARY_CATEGORIES,
  BENEFICIARY_STATUSES,
  type Beneficiary,
  type BeneficiaryCategory,
  type BeneficiaryStatus,
} from '@/types/api';

const beneficiarySchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the beneficiary’s full name.').max(120),
  phone: z.string().trim().max(40).optional(),
  category: z.enum(BENEFICIARY_CATEGORIES, { message: 'Choose a support category.' }),
  status: z.enum(BENEFICIARY_STATUSES, { message: 'Choose a status.' }),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

export interface BeneficiaryFormModalProps {
  isOpen: boolean;
  beneficiary: Beneficiary | null;
  onClose: () => void;
}

export function BeneficiaryFormModal({ isOpen, beneficiary, onClose }: BeneficiaryFormModalProps) {
  const isEditing = beneficiary !== null;

  const createMutation = useCreateBeneficiaryMutation(() => onClose());
  const updateMutation = useUpdateBeneficiaryMutation(() => onClose());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    mode: 'onSubmit',
    defaultValues: { fullName: '', phone: '', category: 'FOOD', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      fullName: beneficiary?.fullName ?? '',
      phone: beneficiary?.phone ?? '',
      category: beneficiary?.category ?? 'FOOD',
      status: beneficiary?.status ?? 'ACTIVE',
    });
  }, [isOpen, beneficiary, reset]);

  const onSubmit = handleSubmit((values) => {
    const input = {
      fullName: values.fullName,
      phone: values.phone || undefined,
      category: values.category as BeneficiaryCategory,
      status: values.status as BeneficiaryStatus,
    };

    if (isEditing) updateMutation.mutate({ id: beneficiary.id, input });
    else createMutation.mutate(input);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit beneficiary' : 'New beneficiary'}
      description={
        isEditing ? 'Update this beneficiary’s details.' : 'Add a beneficiary receiving aid.'
      }
      isBusy={createMutation.isPending || updateMutation.isPending}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="beneficiary-form"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Save changes' : 'Create beneficiary'}
          </Button>
        </>
      }
    >
      <form id="beneficiary-form" onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Full name" required error={errors.fullName?.message}>
          {({ id, hasError, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              autoFocus
              placeholder="Amina Yusuf"
              {...register('fullName')}
            />
          )}
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          {({ id, hasError, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              type="tel"
              placeholder="+1 555 0100"
              {...register('phone')}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category" required error={errors.category?.message}>
            {({ id, hasError, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                {...register('category')}
              >
                {BENEFICIARY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Status" required error={errors.status?.message}>
            {({ id, hasError, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                {...register('status')}
              >
                {BENEFICIARY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </form>
    </Modal>
  );
}
