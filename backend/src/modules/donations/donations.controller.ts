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

import { CreateDonationDto } from './dto/create-donation.dto.js';
import { DonationQueryDto } from './dto/donation-query.dto.js';
import { DonationResponseDto } from './dto/donation-response.dto.js';
import { UpdateDonationDto } from './dto/update-donation.dto.js';
import { DonationsService } from './donations.service.js';

@ApiTags('Donations')
@ApiBearerAuth('access-token')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List donations with search, donor, date-range and amount filters.',
  })
  @ApiOkResponse({ description: 'A page of donations plus pagination metadata.' })
  findAll(@Query() query: DonationQueryDto) {
    return this.donationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single donation.' })
  @ApiOkResponse({ type: DonationResponseDto })
  @ApiNotFoundResponse({ description: 'No donation with that id.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DonationResponseDto> {
    return this.donationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record a donation. donationDate defaults to today.' })
  @ApiCreatedResponse({ type: DonationResponseDto })
  @ApiNotFoundResponse({ description: 'The referenced donor does not exist.' })
  create(@Body() dto: CreateDonationDto): Promise<DonationResponseDto> {
    return this.donationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a donation.' })
  @ApiOkResponse({ type: DonationResponseDto })
  @ApiNotFoundResponse({ description: 'No donation with that id, or the donor does not exist.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonationDto,
  ): Promise<DonationResponseDto> {
    return this.donationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a donation.' })
  @ApiNoContentResponse({ description: 'The donation was deleted.' })
  @ApiNotFoundResponse({ description: 'No donation with that id.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.donationsService.remove(id);
  }
}
