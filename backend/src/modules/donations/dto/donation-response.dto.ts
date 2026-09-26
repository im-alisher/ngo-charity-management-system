import { ApiProperty } from '@nestjs/swagger';

export class DonationDonorSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: 'jane@example.org', nullable: true })
  email: string | null = null;
}

export class DonationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ type: DonationDonorSummaryDto })
  donor!: DonationDonorSummaryDto;

  @ApiProperty({ example: 250.0 })
  amount!: number;

  @ApiProperty({ format: 'date', example: '2026-09-26' })
  donationDate!: Date;

  @ApiProperty({ example: 'General donation towards groceries.', nullable: true })
  notes: string | null = null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
