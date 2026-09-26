import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class DonorQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'jane',
    description: 'Search for donors by full name, email or phone (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  @MaxLength(160)
  search?: string;
}
