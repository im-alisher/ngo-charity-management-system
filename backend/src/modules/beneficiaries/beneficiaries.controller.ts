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

import { BeneficiariesService } from './beneficiaries.service.js';
import { BeneficiaryQueryDto } from './dto/beneficiary-query.dto.js';
import { BeneficiaryResponseDto } from './dto/beneficiary-response.dto.js';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto.js';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto.js';

@ApiTags('Beneficiaries')
@ApiBearerAuth('access-token')
@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get()
  @ApiOperation({
    summary: 'List beneficiaries, with optional search, category and status filters.',
  })
  @ApiOkResponse({ description: 'A page of beneficiaries plus pagination metadata.' })
  findAll(@Query() query: BeneficiaryQueryDto) {
    return this.beneficiariesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single beneficiary.' })
  @ApiOkResponse({ type: BeneficiaryResponseDto })
  @ApiNotFoundResponse({ description: 'No beneficiary with that id.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BeneficiaryResponseDto> {
    return this.beneficiariesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new beneficiary. Status defaults to ACTIVE.' })
  @ApiCreatedResponse({ type: BeneficiaryResponseDto })
  create(@Body() dto: CreateBeneficiaryDto): Promise<BeneficiaryResponseDto> {
    return this.beneficiariesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a beneficiary.' })
  @ApiOkResponse({ type: BeneficiaryResponseDto })
  @ApiNotFoundResponse({ description: 'No beneficiary with that id.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeneficiaryDto,
  ): Promise<BeneficiaryResponseDto> {
    return this.beneficiariesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a beneficiary.' })
  @ApiNoContentResponse({ description: 'The beneficiary was deleted.' })
  @ApiNotFoundResponse({ description: 'No beneficiary with that id.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.beneficiariesService.remove(id);
  }
}
