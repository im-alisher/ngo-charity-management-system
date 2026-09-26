import { ApiProperty } from '@nestjs/swagger';
import { BeneficiaryCategory, BeneficiaryStatus } from '@prisma/client';

export class DashboardStatDto {
  @ApiProperty({ example: 128, description: 'Number of registered donors.' })
  totalDonors!: number;

  @ApiProperty({ example: 42500.75, description: 'Sum of every donation ever recorded.' })
  totalDonationAmount!: number;

  @ApiProperty({ example: 64, description: 'Beneficiaries currently marked ACTIVE.' })
  activeBeneficiaries!: number;

  @ApiProperty({ example: 512, description: 'Number of recorded donations.' })
  totalDonations!: number;
}

export class RecentDonationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 250.0 })
  amount!: number;

  @ApiProperty({ format: 'date', example: '2026-09-26' })
  donationDate!: Date;

  @ApiProperty({ example: 'jane@example.org', nullable: true })
  donorEmail: string | null = null;

  @ApiProperty({ example: 'Jane Doe' })
  donorName!: string;

  @ApiProperty({ example: 'General donation towards groceries.', nullable: true })
  notes: string | null = null;
}

export class BeneficiaryBreakdownItemDto {
  @ApiProperty({ enum: BeneficiaryCategory })
  category!: BeneficiaryCategory;

  @ApiProperty({ enum: BeneficiaryStatus })
  status!: BeneficiaryStatus;

  @ApiProperty({ example: 12 })
  count!: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardStatDto })
  stats!: DashboardStatDto;

  @ApiProperty({
    type: [RecentDonationDto],
    description: 'The most recent donations, newest first.',
  })
  recentDonations!: RecentDonationDto[];

  @ApiProperty({
    type: [BeneficiaryBreakdownItemDto],
    description: 'Beneficiary counts grouped by category and status.',
  })
  beneficiaryBreakdown!: BeneficiaryBreakdownItemDto[];
}
