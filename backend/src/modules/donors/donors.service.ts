import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { buildPaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { toPrismaPagination } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { CreateDonorDto } from './dto/create-donor.dto.js';
import type { DonorQueryDto } from './dto/donor-query.dto.js';
import type { DonorDonationHistoryItemDto, DonorResponseDto } from './dto/donor-response.dto.js';
import type { UpdateDonorDto } from './dto/update-donor.dto.js';
import { toDonationHistoryItem, toDonorResponse } from './donors.mapper.js';

/** Fields scanned when a `search` term is supplied. */
const SEARCHABLE_FIELDS = ['fullName', 'email', 'phone'] as const;

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: DonorQueryDto) {
    const { skip, take } = toPrismaPagination(query.page, query.pageSize);
    const where = this.buildSearchFilter(query.search);

    const [donors, total] = await this.prisma.$transaction([
      this.prisma.donor.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.donor.count({ where }),
    ]);

    return buildPaginatedResponse(donors.map(toDonorResponse), total, query.page, query.pageSize);
  }

  async findOne(id: string): Promise<DonorResponseDto> {
    const donor = await this.prisma.donor.findUnique({ where: { id } });
    if (!donor) throw new NotFoundException(`Donor ${id} was not found.`);
    return toDonorResponse(donor);
  }

  /** Full donor record together with every donation they have made. */
  async findOneWithDonations(
    id: string,
  ): Promise<{ donor: DonorResponseDto; donations: DonorDonationHistoryItemDto[] }> {
    const donor = await this.prisma.donor.findUnique({
      where: { id },
      include: { donations: { orderBy: { donationDate: 'desc' } } },
    });
    if (!donor) throw new NotFoundException(`Donor ${id} was not found.`);

    return {
      donor: toDonorResponse(donor),
      donations: donor.donations.map(toDonationHistoryItem),
    };
  }

  async create(dto: CreateDonorDto): Promise<DonorResponseDto> {
    const donor = await this.prisma.donor.create({ data: this.toCreateData(dto) });
    return toDonorResponse(donor);
  }

  async update(id: string, dto: UpdateDonorDto): Promise<DonorResponseDto> {
    await this.ensureExists(id);
    const donor = await this.prisma.donor.update({ where: { id }, data: this.toUpdateData(dto) });
    return toDonorResponse(donor);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    // Donations cascade-delete with the donor (see the Prisma schema).
    await this.prisma.donor.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.donor.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Donor ${id} was not found.`);
  }

  /**
   * Case-insensitive `contains` search across name, email and phone.
   * Blank values are ignored so an empty search box behaves like no filter.
   */
  private buildSearchFilter(search?: string): Prisma.DonorWhereInput | undefined {
    const term = search?.trim();
    if (!term) return undefined;

    return {
      OR: SEARCHABLE_FIELDS.map((field) => ({
        [field]: { contains: term, mode: 'insensitive' },
      })),
    } satisfies Prisma.DonorWhereInput;
  }

  private toCreateData(dto: CreateDonorDto): Prisma.DonorCreateInput {
    return {
      fullName: dto.fullName.trim(),
      email: dto.email?.trim() || null,
      phone: dto.phone?.trim() || null,
      address: dto.address?.trim() || null,
    };
  }

  private toUpdateData(dto: UpdateDonorDto): Prisma.DonorUpdateInput {
    const data: Prisma.DonorUpdateInput = {};

    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.email !== undefined) data.email = dto.email?.trim() || null;
    if (dto.phone !== undefined) data.phone = dto.phone?.trim() || null;
    if (dto.address !== undefined) data.address = dto.address?.trim() || null;

    return data;
  }
}
