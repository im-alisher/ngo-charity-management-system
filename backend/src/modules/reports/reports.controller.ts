import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { ReportQueryDto } from './dto/report-query.dto.js';
import { DonationReportDto } from './dto/report-response.dto.js';
import { ReportsService } from './reports.service.js';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('donations')
  @ApiOperation({
    summary: 'Donation summary, monthly totals and top donors for a period.',
    description:
      'The monthly breakdown always covers a single calendar year: the `year` filter when given, ' +
      'otherwise the year the period falls in, otherwise the current year.',
  })
  @ApiOkResponse({ type: DonationReportDto })
  getDonationReport(@Query() query: ReportQueryDto): Promise<DonationReportDto> {
    return this.reportsService.getDonationReport(query);
  }

  @Get('donations/list')
  @ApiOperation({ summary: 'Paginated donation list for a period, with filters applied.' })
  @ApiOkResponse({ description: 'A page of donations plus pagination metadata.' })
  findDonations(@Query() query: ReportQueryDto) {
    return this.reportsService.findDonations(query);
  }

  @Get('donations/export')
  @ApiOperation({ summary: 'Download every donation in the period as a CSV file.' })
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'An RFC 4180 CSV document.',
    schema: { type: 'string', format: 'binary' },
  })
  async exportDonationsCsv(
    @Query() query: ReportQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.reportsService.exportDonationsCsv(query);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${buildFileName(query)}"`);
    response.send(csv);
  }
}

/** Builds a stable, filesystem-safe name such as `donations-from-2026-01-01-to-2026-12-31.csv`. */
function buildFileName(query: ReportQueryDto): string {
  const parts = ['donations'];
  if (query.from) parts.push(`from-${query.from}`);
  if (query.to) parts.push(`to-${query.to}`);
  return `${parts.join('-')}.csv`;
}
