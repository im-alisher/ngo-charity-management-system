import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useDonorHistoryQuery } from '@/features/donors/queries';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Donor } from '@/types/api';

export interface DonorHistoryModalProps {
  donor: Donor | null;
  onClose: () => void;
}

export function DonorHistoryModal({ donor, onClose }: DonorHistoryModalProps) {
  // The history is only fetched once the modal is actually open for a donor.
  const { data: donations, isPending, isError, error } = useDonorHistoryQuery(donor?.id ?? null);

  const total = (donations ?? []).reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <Modal
      isOpen={donor !== null}
      onClose={onClose}
      title={donor ? `Donations by ${donor.fullName}` : 'Donation history'}
      description={
        donor ? `${formatCurrency(total)} across ${donations?.length ?? 0} donations.` : undefined
      }
      size="lg"
    >
      {isPending ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner label="Loading donation history" />
        </div>
      ) : isError ? (
        <p className="py-6 text-center text-sm text-red-600">
          {error instanceof Error ? error.message : 'Could not load the donation history.'}
        </p>
      ) : !donations || donations.length === 0 ? (
        <EmptyState
          title="No donations recorded"
          description="Donations recorded for this donor will appear here."
        />
      ) : (
        <ul className="divide-y divide-neutral-100">
          {donations.map((donation) => (
            <li
              key={donation.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{formatDate(donation.donationDate, 'long')}</p>
                {donation.notes ? (
                  <p className="mt-0.5 text-sm text-ink-subtle">{donation.notes}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                {donation.notes ? null : <Badge>No note</Badge>}
                <p className="font-semibold text-ink tabular-nums">
                  {formatCurrency(donation.amount)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end border-t border-neutral-200 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
