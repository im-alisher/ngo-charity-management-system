import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

import { NonBlankString } from '../../../common/decorators/non-blank-string.decorator.js';
import { BeneficiaryCategory, BeneficiaryStatus } from '@prisma/client';

export class CreateBeneficiaryDto {
  @ApiProperty({ example: 'Ali Hassan', maxLength: 160 })
  @NonBlankString({ maxLength: 160 })
  fullName!: string;

  @ApiPropertyOptional({ example: '+1 (555) 987 6543', nullable: true })
  @IsOptional()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({
    enum: BeneficiaryCategory,
    example: BeneficiaryCategory.FOOD,
    description: 'Food, Education or Medical.',
  })
  @IsEnum(BeneficiaryCategory, {
    message: `category must be one of: ${Object.values(BeneficiaryCategory).join(', ')}`,
  })
  category!: BeneficiaryCategory;

  @ApiPropertyOptional({
    enum: BeneficiaryStatus,
    default: BeneficiaryStatus.ACTIVE,
    description: 'Defaults to ACTIVE when omitted.',
  })
  @IsOptional()
  @IsEnum(BeneficiaryStatus, {
    message: `status must be one of: ${Object.values(BeneficiaryStatus).join(', ')}`,
  })
  status?: BeneficiaryStatus;
}
