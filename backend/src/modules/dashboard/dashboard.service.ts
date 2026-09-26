import { Injectable } from '@nestjs/common';
import { BeneficiaryCategory, BeneficiaryStatus, type Prisma } from '@prisma/client';

import { toAmount } from '../../common/utils/amount.util.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type {
  BeneficiaryBreakdownItemDto,
  DashboardResponseDto,
  RecentDonationDto,
} from './dto/dashboard-response.dto.js';

/** How many donations the dashboard preview shows. */
const RECENT_DONATIONS_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates everything the dashboard shows.
   *
   * The independent counts and sums are wrapped in a single transaction so a
   * donation recorded mid-request cannot make the tiles disagree with each
   * other. The recent list and breakdown run alongside them in parallel.
   */
  async getOverview(): Promise<DashboardResponseDto> {
    const [totals, recentDonations, beneficiaryGroups] = await Promise.all([
      this.prisma.$transaction([
        this.prisma.donor.count(),
        this.prisma.donation.count(),
        this.prisma.donation.aggregate({ _sum: { amount: true } }),
        this.prisma.beneficiary.count({ where: { status: BeneficiaryStatus.ACTIVE } }),
      ]),
      this.prisma.donation.findMany({
        take: RECENT_DONATIONS_LIMIT,
        orderBy: [{ donationDate: 'desc' }, { createdAt: 'desc' }],
        include: { donor: { select: { fullName: true, email: true } } },
      }),
      this.prisma.beneficiary.groupBy({
        by: ['category', 'status'],
        _count: { _all: true },
      }),
    ]);

    const [totalDonors, totalDonations, amountAggregate, activeBeneficiaries] = totals;

    return {
      stats: {
        totalDonors,
        totalDonations,
        totalDonationAmount: toAmount(amountAggregate._sum.amount),
        activeBeneficiaries,
      },
      recentDonations: recentDonations.map(toRecentDonation),
      beneficiaryBreakdown: toBreakdown(beneficiaryGroups),
    };
  }
}

type RecentDonationRecord = Prisma.DonationGetPayload<{
  include: { donor: { select: { fullName: true; email: true } } };
}>;

function toRecentDonation(donation: RecentDonationRecord): RecentDonationDto {
  return {
    id: donation.id,
    amount: toAmount(donation.amount),
    donationDate: donation.donationDate,
    donorName: donation.donor.fullName,
    donorEmail: donation.donor.email,
    notes: donation.notes,
  };
}

/** Row shape returned by `beneficiary.groupBy({ by: ['category', 'status'] })`. */
type BeneficiaryGroup = {
  category: BeneficiaryCategory;
  status: BeneficiaryStatus;
  _count: { _all: number };
};

function toBreakdown(groups: BeneficiaryGroup[]): BeneficiaryBreakdownItemDto[] {
  return groups
    .map((group) => ({
      category: group.category,
      status: group.status,
      count: group._count._all,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.status.localeCompare(b.status));
}
