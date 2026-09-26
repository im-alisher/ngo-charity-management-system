import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { AuthService } from './auth.service.js';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserRoleDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/auth-response.dto.js';

/**
 * Account administration.
 *
 * Every route here is `@Roles(ADMIN)`, so managing who can sign in is never
 * something a `STAFF` or `VIEWER` account can do.
 */
@ApiTags('users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List every account (admin only).' })
  list(): Promise<UserResponseDto[]> {
    return this.usersService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create an account with a role (admin only).' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // Hashing belongs to the auth module, so the service takes the hash.
    return this.authService
      .hashPassword(dto.password)
      .then((hash) => this.usersService.create(dto.email, hash, dto.role));
  }

  @Patch(':id/role')
  @ApiOperation({ summary: "Change an account's role (admin only)." })
  updateRole(
    // Validated so a malformed id is a 400 rather than a Prisma failure.
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRole(id, dto.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account (admin only).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
