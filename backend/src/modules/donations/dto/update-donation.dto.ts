import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

import { MAX_DONATION_AMOUNT } from './create-donation.dto.js';

export class UpdateDonationDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Reassign the donation to another donor.' })
  @IsOptional()
  @IsUUID('4', { message: 'donorId must be a valid UUID' })
  donorId?: string;

  @ApiPropertyOptional({ example: 300.0, minimum: 0.01, maximum: MAX_DONATION_AMOUNT })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'amount must be greater than 0' })
  @Max(MAX_DONATION_AMOUNT, { message: `amount must not exceed ${MAX_DONATION_AMOUNT}` })
  amount?: number;

  @ApiPropertyOptional({ format: 'date', example: '2026-09-26' })
  @IsOptional()
  @IsDateString({}, { message: 'donationDate must be a valid ISO date (YYYY-MM-DD)' })
  donationDate?: string;

  @ApiPropertyOptional({ example: 'Updated note.', nullable: true })
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
