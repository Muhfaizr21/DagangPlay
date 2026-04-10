import {
  UseGuards,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  Req,
} from '@nestjs/common';
import { FinanceService } from './finance.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_finance')
@Controller('admin/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  async getSummary() {
    return this.financeService.getFinanceSummary();
  }

  // ================ DEPOSITS ================
  @Get('deposits')
  async getDeposits(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.financeService.getDeposits({ status, search });
  }

  @Post('deposits/:id/confirm')
  @HttpCode(200)
  async confirmDeposit(@Param('id') id: string, @Req() req: any) {
    return this.financeService.confirmDeposit(id, req.user.id);
  }

  @Post('deposits/:id/reject')
  @HttpCode(200)
  async rejectDeposit(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.financeService.rejectDeposit(
      id,
      reason || 'No Reason',
      req.user.id,
    );
  }

  // ============== WITHDRAWALS ================
  @Get('withdrawals')
  async getWithdrawals(@Query('status') status?: string) {
    return this.financeService.getWithdrawals({ status });
  }

  @Post('withdrawals/:id/process')
  @HttpCode(200)
  async processWithdrawal(
    @Param('id') id: string,
    @Body() body: { note?: string; receiptImage?: string },
    @Req() req: any,
  ) {
    return this.financeService.processWithdrawal(
      id,
      req.user.id,
      body.note,
      body.receiptImage,
    );
  }

  @Post('withdrawals/:id/reject')
  @HttpCode(200)
  async rejectWithdrawal(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.financeService.rejectWithdrawal(
      id,
      reason || 'No Reason',
      req.user.id,
    );
  }
}
