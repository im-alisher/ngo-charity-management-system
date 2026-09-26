import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

const optionalString = ({ value }: TransformFnParams) =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

/** A four digit calendar year, e.g. `2026`. */
const YEAR_PATTERN = /^\d{4}$/;

export class ReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Only donations on or after this date.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'from must be a valid ISO date (YYYY-MM-DD)' })
  @Transform(optionalString)
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Only donations on or before this date.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'to must be a valid ISO date (YYYY-MM-DD)' })
  @Transform(optionalString)
  to?: string;

  @ApiPropertyOptional({
    example: '2026',
    description: 'Calendar year used for the monthly breakdown and CSV export.',
  })
  @IsOptional()
  @Matches(YEAR_PATTERN, {
    message: 'year must be a four digit calendar year, for example 2026',
  })
  year?: string;

  @ApiPropertyOptional({
    example: 'jane',
    description: 'Restrict the report to matching donors or notes.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;
}
