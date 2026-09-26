import { Injectable, NotFoundException } from '@nestjs/common';
import { BeneficiaryStatus, type Prisma } from '@prisma/client';

import { buildPaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { toPrismaPagination } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { toBeneficiaryResponse } from './beneficiaries.mapper.js';
import type { BeneficiaryQueryDto } from './dto/beneficiary-query.dto.js';
import type { BeneficiaryResponseDto } from './dto/beneficiary-response.dto.js';
import type { CreateBeneficiaryDto } from './dto/create-beneficiary.dto.js';
import type { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto.js';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BeneficiaryQueryDto) {
    const { skip, take } = toPrismaPagination(query.page, query.pageSize);
    const where = this.buildWhere(query);

    const [beneficiaries, total] = await this.prisma.$transaction([
      this.prisma.beneficiary.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.beneficiary.count({ where }),
    ]);

    return buildPaginatedResponse(
      beneficiaries.map(toBeneficiaryResponse),
      total,
      query.page,
      query.pageSize,
    );
  }

  async findOne(id: string): Promise<BeneficiaryResponseDto> {
    const beneficiary = await this.prisma.beneficiary.findUnique({ where: { id } });
    if (!beneficiary) throw new NotFoundException(`Beneficiary ${id} was not found.`);
    return toBeneficiaryResponse(beneficiary);
  }

  async create(dto: CreateBeneficiaryDto): Promise<BeneficiaryResponseDto> {
    const beneficiary = await this.prisma.beneficiary.create({
      data: {
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim() || null,
        category: dto.category,
        status: dto.status ?? BeneficiaryStatus.ACTIVE,
      },
    });
    return toBeneficiaryResponse(beneficiary);
  }

  async update(id: string, dto: UpdateBeneficiaryDto): Promise<BeneficiaryResponseDto> {
    await this.ensureExists(id);

    const data: Prisma.BeneficiaryUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone?.trim() || null;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.status !== undefined) data.status = dto.status;

    const beneficiary = await this.prisma.beneficiary.update({ where: { id }, data });
    return toBeneficiaryResponse(beneficiary);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.beneficiary.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.beneficiary.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Beneficiary ${id} was not found.`);
  }

  private buildWhere(query: BeneficiaryQueryDto): Prisma.BeneficiaryWhereInput {
    const where: Prisma.BeneficiaryWhereInput = {};

    const term = query.search?.trim();
    if (term) {
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.category !== undefined) where.category = query.category;
    if (query.status !== undefined) where.status = query.status;

    return where;
  }
}
