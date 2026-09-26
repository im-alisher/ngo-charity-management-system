import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildPaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { toPrismaPagination } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { CreateDonationDto } from './dto/create-donation.dto.js';
import type { DonationQueryDto } from './dto/donation-query.dto.js';
import type { DonationResponseDto } from './dto/donation-response.dto.js';
import type { UpdateDonationDto } from './dto/update-donation.dto.js';
import { toDonationResponse } from './donations.mapper.js';

/** The donor columns always included, so no extra query is needed to render a row. */
const DONOR_INCLUDE = {
  donor: { select: { id: true, fullName: true, email: true } },
} satisfies Prisma.DonationInclude;

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: DonationQueryDto) {
    const { skip, take } = toPrismaPagination(query.page, query.pageSize);
    const where = this.buildWhere(query);

    const [donations, total] = await this.prisma.$transaction([
      this.prisma.donation.findMany({
        where,
        include: DONOR_INCLUDE,
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

  async findOne(id: string): Promise<DonationResponseDto> {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: DONOR_INCLUDE,
    });
    if (!donation) throw new NotFoundException(`Donation ${id} was not found.`);
    return toDonationResponse(donation);
  }

  async create(dto: CreateDonationDto): Promise<DonationResponseDto> {
    await this.ensureDonorExists(dto.donorId);

    const donation = await this.prisma.donation.create({
      data: {
        donorId: dto.donorId,
        amount: toDecimal(dto.amount),
        donationDate: this.toDate(dto.donationDate),
        notes: dto.notes?.trim() || null,
      },
      include: DONOR_INCLUDE,
    });

    return toDonationResponse(donation);
  }

  async update(id: string, dto: UpdateDonationDto): Promise<DonationResponseDto> {
    await this.ensureDonationExists(id);
    if (dto.donorId !== undefined) await this.ensureDonorExists(dto.donorId);

    const data: Prisma.DonationUpdateInput = {};
    if (dto.donorId !== undefined) data.donor = { connect: { id: dto.donorId } };
    if (dto.amount !== undefined) data.amount = toDecimal(dto.amount);
    if (dto.donationDate !== undefined) data.donationDate = this.toDate(dto.donationDate);
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null;

    const donation = await this.prisma.donation.update({
      where: { id },
      data,
      include: DONOR_INCLUDE,
    });

    return toDonationResponse(donation);
  }

  async remove(id: string): Promise<void> {
    await this.ensureDonationExists(id);
    await this.prisma.donation.delete({ where: { id } });
  }

  private async ensureDonationExists(id: string): Promise<void> {
    const exists = await this.prisma.donation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Donation ${id} was not found.`);
  }

  private async ensureDonorExists(donorId: string): Promise<void> {
    const exists = await this.prisma.donor.findUnique({
      where: { id: donorId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(
        `Donor ${donorId} was not found. Create the donor before recording a donation.`,
      );
    }
  }

  private buildWhere(query: DonationQueryDto): Prisma.DonationWhereInput {
    const where: Prisma.DonationWhereInput = {};

    const term = query.search?.trim();
    if (term) {
      where.OR = [
        { donor: { fullName: { contains: term, mode: 'insensitive' } } },
        { donor: { email: { contains: term, mode: 'insensitive' } } },
        { notes: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.donorId !== undefined) where.donorId = query.donorId;

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

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      if (
        query.minAmount !== undefined &&
        query.maxAmount !== undefined &&
        query.minAmount > query.maxAmount
      ) {
        throw new BadRequestException('`minAmount` must be less than or equal to `maxAmount`.');
      }

      where.amount = {
        ...(query.minAmount !== undefined ? { gte: toDecimal(query.minAmount) } : {}),
        ...(query.maxAmount !== undefined ? { lte: toDecimal(query.maxAmount) } : {}),
      };
    }

    return where;
  }

  /**
   * `donationDate` is a `DATE` column, so only the calendar day is stored.
   * An omitted date means "today"; the value is normalised to UTC midnight to
   * keep the stored day independent of the server's local offset.
   */
  private toDate(value?: string): Date {
    if (!value) {
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
    return new Date(`${value}T00:00:00.000Z`);
  }
}

/** Money is stored as `Decimal(14,2)`, so normalise to exactly two decimals. */
function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}
