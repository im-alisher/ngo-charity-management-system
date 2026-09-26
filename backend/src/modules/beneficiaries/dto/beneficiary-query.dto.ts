import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BeneficiaryCategory, BeneficiaryStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class BeneficiaryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'ali',
    description: 'Search for beneficiaries by full name or phone (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  @MaxLength(160)
  search?: string;

  @ApiPropertyOptional({ enum: BeneficiaryCategory, example: BeneficiaryCategory.FOOD })
  @IsOptional()
  @IsEnum(BeneficiaryCategory, {
    message: `category must be one of: ${Object.values(BeneficiaryCategory).join(', ')}`,
  })
  category?: BeneficiaryCategory;

  @ApiPropertyOptional({ enum: BeneficiaryStatus, example: BeneficiaryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(BeneficiaryStatus, {
    message: `status must be one of: ${Object.values(BeneficiaryStatus).join(', ')}`,
  })
  status?: BeneficiaryStatus;
}
