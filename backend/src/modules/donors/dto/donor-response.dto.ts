import { ApiProperty } from '@nestjs/swagger';

export class DonorResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: 'jane@example.org', nullable: true })
  email: string | null = null;

  @ApiProperty({ example: '+1 (555) 123 4567', nullable: true })
  phone: string | null = null;

  @ApiProperty({ example: '123 Elm Street, Springfield', nullable: true })
  address: string | null = null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}

export class DonorDonationHistoryItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    example: 500.0,
    description: 'Donation amount in the currency used by the charity.',
  })
  amount!: number;

  @ApiProperty({ format: 'date', example: '2026-09-01' })
  donationDate!: Date;

  @ApiProperty({ example: 'General donation towards groceries.', nullable: true })
  notes: string | null = null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}

export class DonorWithDonationsDto extends DonorResponseDto {
  @ApiProperty({ type: [DonorDonationHistoryItemDto] })
  donations!: DonorDonationHistoryItemDto[];
}
