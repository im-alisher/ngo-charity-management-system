import { BadRequestException, Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { buildPaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { toPrismaPagination } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { toAmount } from '../../common/utils/amount.util.js';
import { toCsv, type CsvColumn } from '../../common/utils/csv.util.js';
import { toDateOnly, toTimestamp } from '../../common/utils/date.util.js';
import { toDonationResponse } from '../donations/donations.mapper.js';
import type { ReportQueryDto } from './dto/report-query.dto.js';
import type {
  DonationReportDto,
  DonationSummaryDto,
  DonorTotalDto,
  MonthlyTotalDto,
} from './dto/report-response.dto.js';

/** Donors listed in the "top donors" table. */
const TOP_DONOR_LIMIT = 5;

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Donation list for the period, reused by the paginated endpoint. */
  async findDonations(query: ReportQueryDto) {
    const { skip, take } = toPrismaPagination(query.page, query.pageSize);
    const where = this.buildWhere(query);

    const [donations, total] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        where,
        include: { donor: { select: { id: true, fullName: true, email: true } } },
        skip,
        take,
        orderBy: [{ donationDate: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.donation.count({ where }),
    ]);

    return buildPaginatedResponse(
      donations.map(toDonationResponse),
      total,
      query.page,
      query.pageSize,
    );
  }

  async getDonationReport(query: ReportQueryDto): Promise<DonationReportDto> {
    const where = this.buildWhere(query);
    const year = this.resolveReportYear(query);

    const [summary, monthlyGroups, topDonorGroups, donations] = await Promise.all([
      this.buildSummary(where),
      this.buildMonthlyTotals(where, year),
      this.buildTopDonors(where),
      this.prisma.donation.findMany({
        where,
        include: { donor: { select: { id: true, fullName: true, email: true } } },
        orderBy: [{ donationDate: 'desc' }, { createdAt: 'desc' }],
        take: 100,
      }),
    ]);

    return {
      period: { from: query.from ?? null, to: query.to ?? null },
      summary,
      monthlyTotals: monthlyGroups,
      topDonors: topDonorGroups,
      donations: donations.map(toDonationResponse),
    };
  }

  /**
   * Renders the full donation set for the period as an RFC 4180 CSV document.
   * Every matching donation is included, not just the first page.
   */
  async exportDonationsCsv(query: ReportQueryDto): Promise<string> {
    const donations = await this.prisma.donation.findMany({
      where: this.buildWhere(query),
      include: { donor: { select: { id: true, fullName: true, email: true } } },
      orderBy: [{ donationDate: 'desc' }, { createdAt: 'desc' }],
    });

    const rows: CsvDonationRow[] = donations.map((donation) => ({
      id: donation.id,
      donationDate: donation.donationDate,
      donorName: donation.donor.fullName,
      donorEmail: donation.donor.email,
      amount: toAmount(donation.amount),
      notes: donation.notes,
      createdAt: donation.createdAt,
    }));

    return toCsv(DONATION_CSV_COLUMNS, rows);
  }

  private buildWhere(query: ReportQueryDto): Prisma.DonationWhereInput {
    const where: Prisma.DonationWhereInput = {};
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined;
    const to = query.to ? new Date(`${query.to}T00:00:00.000Z`) : undefined;

    if (from && to && from > to) {
      throw new BadRequestException('`from` must be on or before `to`.');
    }

    if (from || to) {
      where.donationDate = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const term = query.search?.trim();
    if (term) {
      where.OR = [
        { donor: { fullName: { contains: term, mode: 'insensitive' } } },
        { donor: { email: { contains: term, mode: 'insensitive' } } },
        { notes: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async buildSummary(where: Prisma.DonationWhereInput): Promise<DonationSummaryDto> {
    const [aggregate, uniqueDonors] = await this.prisma.$transaction([
      this.prisma.donation.aggregate({
        where,
        _count: { _all: true },
        _sum: { amount: true },
        _avg: { amount: true },
        _max: { amount: true },
      }),
      this.prisma.donation.findMany({ where, select: { donorId: true }, distinct: ['donorId'] }),
    ]);

    const totalAmount = toAmount(aggregate._sum.amount);
    const totalDonations = aggregate._count._all;

    return {
      totalDonations,
      totalAmount,
      averageAmount: totalDonations > 0 ? roundToTwo(totalAmount / totalDonations) : 0,
      largestDonation: toAmount(aggregate._max.amount),
      uniqueDonors: uniqueDonors.length,
    };
  }

  /**
   * Totals per calendar month for the requested year.
   *
   * `donationDate` is a `DATE` column, so the grouping happens per day in SQL
   * and the days are bucketed into months here. That keeps the query inside
   * Prisma's type system instead of hand-writing SQL, and the intermediate row
   * count is one per calendar day, which stays small for a charity's history.
   *
   * Days outside the requested year are discarded while bucketing. Months
   * without donations are absent from the result, so a chart can render only
   * the periods that actually received money.
   */
  private async buildMonthlyTotals(
    where: Prisma.DonationWhereInput,
    year: number,
  ): Promise<MonthlyTotalDto[]> {
    const dailyTotals = await this.prisma.donation.groupBy({
      by: ['donationDate'],
      where,
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { donationDate: 'asc' },
    });

    const byMonth = new Map<string, MonthlyTotalDto>();

    for (const day of dailyTotals) {
      const dayDate = new Date(day.donationDate);
      if (dayDate.getUTCFullYear() !== year) continue;

      const monthIndex = dayDate.getUTCMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const amount = toAmount(day._sum.amount);
      const existing = byMonth.get(key);

      if (existing) {
        existing.totalDonations += day._count._all;
        existing.totalAmount = roundToTwo(existing.totalAmount + amount);
        continue;
      }

      byMonth.set(key, {
        month: key,
        label: `${MONTH_LABELS[monthIndex]} ${year}`,
        totalDonations: day._count._all,
        totalAmount: amount,
      });
    }

    return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
  }

  private async buildTopDonors(where: Prisma.DonationWhereInput): Promise<DonorTotalDto[]> {
    const groups = await this.prisma.donation.groupBy({
      by: ['donorId'],
      where,
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: TOP_DONOR_LIMIT,
    });

    if (groups.length === 0) return [];

    const donors = await this.prisma.donor.findMany({
      where: { id: { in: groups.map((group) => group.donorId) } },
      select: { id: true, fullName: true },
    });

    const namesById = new Map(donors.map((donor) => [donor.id, donor.fullName]));

    return groups.map((group) => ({
      donorId: group.donorId,
      donorName: namesById.get(group.donorId) ?? 'Unknown donor',
      totalDonations: group._count._all,
      totalAmount: toAmount(group._sum.amount),
    }));
  }

  /**
   * The year the monthly breakdown should cover: the explicit `year` filter,
   * otherwise the year the reporting period falls in, otherwise the current one.
   */
  private resolveReportYear(query: ReportQueryDto): number {
    if (query.year !== undefined) return Number(query.year);

    if (query.from) return Number(query.from.slice(0, 4));
    if (query.to) return Number(query.to.slice(0, 4));

    return new Date().getUTCFullYear();
  }
}

type CsvDonationRow = {
  id: string;
  donationDate: Date;
  donorName: string;
  donorEmail: string | null;
  amount: number;
  notes: string | null;
  createdAt: Date;
};

const DONATION_CSV_COLUMNS: CsvColumn<CsvDonationRow>[] = [
  { header: 'Donation ID', value: (row) => row.id },
  { header: 'Donation date', value: (row) => toDateOnly(row.donationDate) },
  { header: 'Donor name', value: (row) => row.donorName },
  { header: 'Donor email', value: (row) => row.donorEmail },
  { header: 'Amount', value: (row) => row.amount.toFixed(2) },
  { header: 'Notes', value: (row) => row.notes },
  { header: 'Recorded at', value: (row) => toTimestamp(row.createdAt) },
];

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
