import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDonorMutation, useUpdateDonorMutation } from '@/features/donors/queries';
import type { Donor } from '@/types/api';

const donorSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the donor’s full name.').max(120),
  email: z.union([z.literal(''), z.email('Enter a valid email address.')]),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(250).optional(),
});

type DonorFormValues = z.infer<typeof donorSchema>;

export interface DonorFormModalProps {
  isOpen: boolean;
  /** `null` opens the form in create mode. */
  donor: Donor | null;
  onClose: () => void;
}

export function DonorFormModal({ isOpen, donor, onClose }: DonorFormModalProps) {
  const isEditing = donor !== null;

  const createMutation = useCreateDonorMutation({ onSuccess: onClose });
  const updateMutation = useUpdateDonorMutation({ onSuccess: onClose });
  const mutation = isEditing ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    mode: 'onSubmit',
    defaultValues: { fullName: '', email: '', phone: '', address: '' },
  });

  // Reload the form whenever the modal opens, so an edit never shows the
  // previously edited donor's values.
  useEffect(() => {
    if (!isOpen) return;
    reset({
      fullName: donor?.fullName ?? '',
      email: donor?.email ?? '',
      phone: donor?.phone ?? '',
      address: donor?.address ?? '',
    });
  }, [isOpen, donor, reset]);

  const onSubmit = handleSubmit((values) => {
    const input = {
      fullName: values.fullName,
      // Blank optional fields are omitted rather than sent as empty strings.
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
    };

    if (isEditing) updateMutation.mutate({ id: donor.id, input });
    else createMutation.mutate(input);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit donor' : 'New donor'}
      description={isEditing ? 'Update this donor’s details.' : 'Add a donor to the system.'}
      isBusy={mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="donor-form" isLoading={mutation.isPending}>
            {isEditing ? 'Save changes' : 'Create donor'}
          </Button>
        </>
      }
    >
      <form id="donor-form" onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Full name" required error={errors.fullName?.message}>
          {({ id, hasError, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              autoFocus
              placeholder="Jane Doe"
              {...register('fullName')}
            />
          )}
        </Field>

        <Field
          label="Email address"
          error={errors.email?.message}
          hint="Used to contact the donor."
        >
          {({ id, hasError, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              type="email"
              placeholder="jane@example.org"
              {...register('email')}
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

        <Field label="Address" error={errors.address?.message}>
          {({ id, hasError, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              rows={3}
              placeholder="Street, city, postal code"
              {...register('address')}
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
