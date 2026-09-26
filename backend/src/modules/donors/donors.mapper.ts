import type { Donor, Prisma } from '@prisma/client';

import { toAmount } from '../../common/utils/amount.util.js';
import type { DonorDonationHistoryItemDto, DonorResponseDto } from './dto/donor-response.dto.js';

export function toDonorResponse(donor: Donor): DonorResponseDto {
  return {
    id: donor.id,
    fullName: donor.fullName,
    email: donor.email,
    phone: donor.phone,
    address: donor.address,
    createdAt: donor.createdAt,
    updatedAt: donor.updatedAt,
  };
}

export type DonationHistoryRecord = Prisma.DonationGetPayload<{
  select: { id: true; amount: true; donationDate: true; notes: true; createdAt: true };
}>;

export function toDonationHistoryItem(
  donation: DonationHistoryRecord,
): DonorDonationHistoryItemDto {
  return {
    id: donation.id,
    amount: toAmount(donation.amount),
    donationDate: donation.donationDate,
    notes: donation.notes,
    createdAt: donation.createdAt,
  };
}
