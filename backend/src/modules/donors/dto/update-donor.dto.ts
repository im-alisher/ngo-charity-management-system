import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

import { NonBlankString } from '../../../common/decorators/non-blank-string.decorator.js';

export class UpdateDonorDto {
  @ApiPropertyOptional({ example: 'Jane M. Doe', maxLength: 160 })
  @IsOptional()
  @NonBlankString({ maxLength: 160 })
  fullName?: string;

  @ApiPropertyOptional({ example: 'jane@example.org', nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ example: '+1 (555) 123 4567', nullable: true })
  @IsOptional()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: '123 Elm Street, Springfield', nullable: true })
  @IsOptional()
  @MaxLength(400)
  address?: string;
}
