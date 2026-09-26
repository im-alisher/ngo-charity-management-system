import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

/** Mirrors the `Decimal(14, 2)` column: the largest storable value is 999999999999.99. */
export const MAX_DONATION_AMOUNT = 999_999_999_999.99;

export class CreateDonationDto {
  @ApiProperty({ format: 'uuid', description: 'Donor making the donation.' })
  @IsUUID('4', { message: 'donorId must be a valid UUID' })
  donorId!: string;

  @ApiProperty({ example: 250.0, minimum: 0.01, maximum: MAX_DONATION_AMOUNT })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'amount must be a number with at most 2 decimal places' },
  )
  @IsPositive({ message: 'amount must be greater than 0' })
  @Max(MAX_DONATION_AMOUNT, { message: `amount must not exceed ${MAX_DONATION_AMOUNT}` })
  amount!: number;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-09-26',
    description: 'Defaults to today when omitted.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'donationDate must be a valid ISO date (YYYY-MM-DD)' })
  donationDate?: string;

  @ApiPropertyOptional({ example: 'General donation towards groceries.', nullable: true })
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
