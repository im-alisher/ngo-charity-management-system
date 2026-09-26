import { ApiProperty } from '@nestjs/swagger';
import { BeneficiaryCategory, BeneficiaryStatus } from '@prisma/client';

export class BeneficiaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ali Hassan' })
  fullName!: string;

  @ApiProperty({ example: '+1 (555) 987 6543', nullable: true })
  phone: string | null = null;

  @ApiProperty({ enum: BeneficiaryCategory, example: BeneficiaryCategory.FOOD })
  category!: BeneficiaryCategory;

  @ApiProperty({ enum: BeneficiaryStatus, example: BeneficiaryStatus.ACTIVE })
  status!: BeneficiaryStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}
