import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDonationMutation, useUpdateDonationMutation } from '@/features/donations/queries';
import { useDonorsQuery } from '@/features/donors/queries';
import { formatCurrency, todayIso } from '@/lib/format';
import type { Donation, Donor } from '@/types/api';

const donationSchema = z
  .object({
    donorId: z.string().uuid('Choose a donor.'),
    amount: z
      .number({ message: 'Enter an amount.' })
      .positive('The amount must be greater than zero.')
      .max(9_999_999_999.99, 'The amount is too large.'),
    donationDate: z.string().min(1, 'Choose a donation date.'),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((values) => !values.donationDate || values.donationDate <= todayIso(), {
    message: 'A donation cannot be dated in the future.',
    path: ['donationDate'],
  });

type DonationFormValues = z.infer<typeof donationSchema>;

export interface DonationFormModalProps {
  isOpen: boolean;
  donation: Donation | null;
  onClose: () => void;
}

export function DonationFormModal({ isOpen, donation, onClose }: DonationFormModalProps) {
  const isEditing = donation !== null;

  const createMutation = useCreateDonationMutation(() => onClose());
  const updateMutation = useUpdateDonationMutation(() => onClose());
  const isBusy = createMutation.isPending || updateMutation.isPending;

  // Only the first page is needed to populate the picker; the select is a
  // lookup, not a full donor directory.
  const { data: donorsData, isPending: isDonorsPending } = useDonorsQuery({
    page: 1,
    pageSize: 50,
  });
  const donors: Donor[] = useMemo(() => donorsData?.data ?? [], [donorsData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    mode: 'onSubmit',
    defaultValues: {
      donorId: '',
      amount: 0,
      donationDate: todayIso(),
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      donorId: donation?.donor.id ?? '',
      amount: donation?.amount ?? 0,
      donationDate: donation?.donationDate ?? todayIso(),
      notes: donation?.notes ?? '',
    });
  }, [isOpen, donation, reset]);

  // `useWatch` subscribes to a single field; it is memoizable, unlike the
  // `watch()` function returned by `useForm`.
  const selectedDonorId = useWatch({ control, name: 'donorId' });
  const amount = useWatch({ control, name: 'amount' });
  const previewAmount = Number.isFinite(amount) ? amount : 0;

  const onSubmit = handleSubmit((values) => {
    const input = {
      donorId: values.donorId,
      amount: values.amount,
      donationDate: values.donationDate,
      notes: values.notes || undefined,
    };

    if (isEditing) updateMutation.mutate({ id: donation.id, input });
    else createMutation.mutate(input);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit donation' : 'Record donation'}
      description={isEditing ? 'Update this donation.' : 'Add a donation to a donor’s history.'}
      isBusy={isBusy}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" form="donation-form" isLoading={isBusy} disabled={isDonorsPending}>
            {isEditing ? 'Save changes' : 'Record donation'}
          </Button>
        </>
      }
    >
      <form id="donation-form" onSubmit={onSubmit} noValidate className="space-y-4">
        <Field
          label="Donor"
          required
          error={errors.donorId?.message}
          hint={isDonorsPending ? 'Loading donors…' : undefined}
        >
          {({ id, hasError, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              disabled={isDonorsPending || donors.length === 0}
              onChange={(event) => {
                // `setValue` is used instead of the registered handler because
                // this select is controlled by the form's watched value.
                setValue('donorId', event.target.value, { shouldValidate: false });
              }}
              value={selectedDonorId}
            >
              <option value="">Select a donor</option>
              {donors.map((donor) => (
                <option key={donor.id} value={donor.id}>
                  {donor.fullName}
                  {donor.email ? ` · ${donor.email}` : ''}
                </option>
              ))}
            </Select>
          )}
        </Field>

        {donors.length === 0 && !isDonorsPending ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No donors available. Add a donor before recording a donation.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount (USD)" required error={errors.amount?.message}>
            {({ id, hasError, describedBy }) => (
              <>
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  hasError={hasError}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
                {/* Live preview, so the user sees the formatted amount. */}
                <p className="text-xs text-ink-subtle">{formatCurrency(previewAmount)}</p>
              </>
            )}
          </Field>

          <Field label="Donation date" required error={errors.donationDate?.message}>
            {({ id, hasError, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                hasError={hasError}
                type="date"
                max={todayIso()}
                {...register('donationDate')}
              />
            )}
          </Field>
        </div>

        <Field label="Notes" error={errors.notes?.message} hint="Optional context about the gift.">
          {({ id, hasError, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              hasError={hasError}
              rows={3}
              placeholder="Monthly pledge, anonymous gift, ..."
              {...register('notes')}
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
