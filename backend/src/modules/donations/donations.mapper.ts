import type { Prisma } from '@prisma/client';

import { toAmount } from '../../common/utils/amount.util.js';
import type { DonationResponseDto } from './dto/donation-response.dto.js';

export type DonationWithDonor = Prisma.DonationGetPayload<{
  include: { donor: { select: { id: true; fullName: true; email: true } } };
}>;

export function toDonationResponse(donation: DonationWithDonor): DonationResponseDto {
  return {
    id: donation.id,
    donor: {
      id: donation.donor.id,
      fullName: donation.donor.fullName,
      email: donation.donor.email,
    },
    amount: toAmount(donation.amount),
    donationDate: donation.donationDate,
    notes: donation.notes,
    createdAt: donation.createdAt,
    updatedAt: donation.updatedAt,
  };
}
