import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { CommonModule } from './common/common.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { AppConfigModule } from './config/config.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BeneficiariesModule } from './modules/beneficiaries/beneficiaries.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { DonationsModule } from './modules/donations/donations.module.js';
import { DonorsModule } from './modules/donors/donors.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    PrismaModule,
    AuthModule,
    DonorsModule,
    BeneficiariesModule,
    DonationsModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    // Deny by default: every route requires a valid token unless marked @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
