import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('merchant/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Roles(Role.MERCHANT)
  @Post('request')
  async requestWithdrawal(@Req() req: any, @Body() dto: any) {
    return this.withdrawalsService.requestWithdrawal(req.user.id, {
      amount: Number(dto.amount),
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
    });
  }

  @Roles(Role.MERCHANT)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.withdrawalsService.getMerchantWithdrawals(req.user.id);
  }

  // Admin level endpoints (could be moved to an admin controller, but placing here for cohesion)
  @Roles(Role.SUPER_ADMIN)
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.withdrawalsService.approveWithdrawal(
      id,
      req.user.id,
      body.receiptImage,
    );
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.withdrawalsService.rejectWithdrawal(
      id,
      req.user.id,
      body.reason,
    );
  }
}
