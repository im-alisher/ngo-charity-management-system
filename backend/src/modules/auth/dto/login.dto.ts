import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@charity.org', description: 'Registered admin email address.' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: 'Str0ngPassw0rd', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;
}
