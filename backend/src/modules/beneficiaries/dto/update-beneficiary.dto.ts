import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { BeneficiaryCategory, BeneficiaryStatus } from '@prisma/client';

import { NonBlankString } from '../../../common/decorators/non-blank-string.decorator.js';

export class UpdateBeneficiaryDto {
  @ApiPropertyOptional({ example: 'Ali M. Hassan', maxLength: 160 })
  @IsOptional()
  @NonBlankString({ maxLength: 160 })
  fullName?: string;

  @ApiPropertyOptional({ example: '+1 (555) 987 6543', nullable: true })
  @IsOptional()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ enum: BeneficiaryCategory, example: BeneficiaryCategory.EDUCATION })
  @IsOptional()
  @IsEnum(BeneficiaryCategory, {
    message: `category must be one of: ${Object.values(BeneficiaryCategory).join(', ')}`,
  })
  category?: BeneficiaryCategory;

  @ApiPropertyOptional({ enum: BeneficiaryStatus, example: BeneficiaryStatus.INACTIVE })
  @IsOptional()
  @IsEnum(BeneficiaryStatus, {
    message: `status must be one of: ${Object.values(BeneficiaryStatus).join(', ')}`,
  })
  status?: BeneficiaryStatus;
}
