import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DashboardResponseDto } from './dto/dashboard-response.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Headline totals, the most recent donations and a beneficiary breakdown.',
  })
  @ApiOkResponse({ type: DashboardResponseDto })
  getOverview(): Promise<DashboardResponseDto> {
    return this.dashboardService.getOverview();
  }
}
