import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@charity.org' })
  email!: string;

  @ApiProperty({ enum: UserRole, description: 'Access level of the account.' })
  role!: UserRole;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token to send as `Authorization: Bearer <token>`.' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ example: '1d', description: 'Access token lifetime.' })
  expiresIn!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
