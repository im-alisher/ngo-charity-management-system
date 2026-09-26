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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateDonorDto } from './dto/create-donor.dto.js';
import { DonorQueryDto } from './dto/donor-query.dto.js';
import type { DonorDonationHistoryItemDto } from './dto/donor-response.dto.js';
import { DonorResponseDto } from './dto/donor-response.dto.js';
import { UpdateDonorDto } from './dto/update-donor.dto.js';
import { DonorsService } from './donors.service.js';

@ApiTags('Donors')
@ApiBearerAuth('access-token')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Get()
  @ApiOperation({ summary: 'List donors, with optional search and pagination.' })
  @ApiOkResponse({ description: 'A page of donors plus pagination metadata.' })
  findAll(@Query() query: DonorQueryDto) {
    return this.donorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single donor.' })
  @ApiOkResponse({ type: DonorResponseDto })
  @ApiNotFoundResponse({ description: 'No donor with that id.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DonorResponseDto> {
    return this.donorsService.findOne(id);
  }

  @Get(':id/donations')
  @ApiOperation({ summary: 'Fetch a donor together with their full donation history.' })
  @ApiOkResponse({ description: 'The donor and their donations, newest first.' })
  @ApiNotFoundResponse({ description: 'No donor with that id.' })
  findOneWithDonations(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ donor: DonorResponseDto; donations: DonorDonationHistoryItemDto[] }> {
    return this.donorsService.findOneWithDonations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new donor.' })
  @ApiCreatedResponse({ type: DonorResponseDto })
  create(@Body() dto: CreateDonorDto): Promise<DonorResponseDto> {
    return this.donorsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a donor.' })
  @ApiOkResponse({ type: DonorResponseDto })
  @ApiNotFoundResponse({ description: 'No donor with that id.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonorDto,
  ): Promise<DonorResponseDto> {
    return this.donorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a donor.',
    description: 'Also deletes the donations attached to this donor.',
  })
  @ApiNoContentResponse({ description: 'The donor was deleted.' })
  @ApiNotFoundResponse({ description: 'No donor with that id.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.donorsService.remove(id);
  }
}
