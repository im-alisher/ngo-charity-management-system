import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { MAX_DONATION_AMOUNT } from './create-donation.dto.js';

/** Treats an absent or blank query parameter as "no filter". */
const optionalString = ({ value }: TransformFnParams) =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

/**
 * Query parameters arrive as strings. A blank value means "no filter";
 * anything else is coerced to a number so the range checks apply to it.
 */
const optionalNumber = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string' || value.trim() === '') return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

export class DonationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'jane',
    description: 'Search by donor name, donor email or donation notes (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Only donations from this donor.' })
  @IsOptional()
  @IsUUID('4', { message: 'donorId must be a valid UUID' })
  donorId?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-01-01',
    description: 'Only donations on or after this date.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'from must be a valid ISO date (YYYY-MM-DD)' })
  @Transform(optionalString)
  from?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-12-31',
    description: 'Only donations on or before this date.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'to must be a valid ISO date (YYYY-MM-DD)' })
  @Transform(optionalString)
  to?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Only donations of at least this amount.',
  })
  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber({}, { message: 'minAmount must be a number' })
  @IsPositive({ message: 'minAmount must be greater than 0' })
  @Max(MAX_DONATION_AMOUNT, { message: `minAmount must not exceed ${MAX_DONATION_AMOUNT}` })
  minAmount?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Only donations of at most this amount.' })
  @IsOptional()
  @Transform(optionalNumber)
  @IsNumber({}, { message: 'maxAmount must be a number' })
  @IsPositive({ message: 'maxAmount must be greater than 0' })
  @Max(MAX_DONATION_AMOUNT, { message: `maxAmount must not exceed ${MAX_DONATION_AMOUNT}` })
  maxAmount?: number;
}
