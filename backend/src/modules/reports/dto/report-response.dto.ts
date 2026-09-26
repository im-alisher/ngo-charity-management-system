import { ApiProperty } from '@nestjs/swagger';

import { DonationResponseDto } from '../../donations/dto/donation-response.dto.js';

export class DonationSummaryDto {
  @ApiProperty({ example: 128, description: 'Number of donations in the period.' })
  totalDonations!: number;

  @ApiProperty({ example: 42500.75, description: 'Sum of every donation in the period.' })
  totalAmount!: number;

  @ApiProperty({ example: 332.03, description: 'Average donation, rounded to 2 decimals.' })
  averageAmount!: number;

  @ApiProperty({ example: 2500.0, description: 'Largest single donation in the period.' })
  largestDonation!: number;

  @ApiProperty({ example: 64, description: 'Distinct donors who gave in the period.' })
  uniqueDonors!: number;
}

export class MonthlyTotalDto {
  @ApiProperty({ example: '2026-01', description: 'Calendar month in YYYY-MM form.' })
  month!: string;

  @ApiProperty({ example: 'January 2026' })
  label!: string;

  @ApiProperty({ example: 12 })
  totalDonations!: number;

  @ApiProperty({ example: 7250.5 })
  totalAmount!: number;
}

export class CategoryTotalDto {
  @ApiProperty({ example: 'FOOD' })
  category!: string;

  @ApiProperty({ example: 8 })
  count!: number;
}

export class DonorTotalDto {
  @ApiProperty({ format: 'uuid' })
  donorId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  donorName!: string;

  @ApiProperty({ example: 6 })
  totalDonations!: number;

  @ApiProperty({ example: 4200.0 })
  totalAmount!: number;
}

export class DonationReportDto {
  @ApiProperty({ description: 'The reporting period that was applied.' })
  period!: { from: string | null; to: string | null };

  @ApiProperty({ type: DonationSummaryDto })
  summary!: DonationSummaryDto;

  @ApiProperty({ type: [MonthlyTotalDto] })
  monthlyTotals!: MonthlyTotalDto[];

  @ApiProperty({ type: [DonorTotalDto], description: 'Top donors by amount.' })
  topDonors!: DonorTotalDto[];

  @ApiProperty({
    type: [DonationResponseDto],
    description: 'Donations in the period, newest first.',
  })
  donations!: DonationResponseDto[];
}
