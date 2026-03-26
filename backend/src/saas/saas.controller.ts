import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SaasService } from './saas.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('saas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  // -------------------------------------------------------------
  // SUPER ADMIN ENDPOINTS
  // -------------------------------------------------------------
  @Get('admin/ledger/escrow')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
  async getGlobalLedgers() {
    return this.saasService.getGlobalLedgers();
  }

  @Get('admin/webhooks/dlq')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
  async getDeadLetterQueue() {
    return this.saasService.getDeadLetterQueue();
  }

  @Post('admin/webhooks/dlq/:id/requeue')
  @Roles(Role.SUPER_ADMIN)
  async requeueDLQJob(@Param('id') jobId: string) {
    return this.saasService.requeueDLQJob(jobId);
  }

  @Get('admin/domains/status')
  @Roles(Role.SUPER_ADMIN)
  async getDomainsStatus() {
    return this.saasService.getMerchantDomainsStatus();
  }

  // -------------------------------------------------------------
  // MERCHANT ENDPOINTS
  // -------------------------------------------------------------
  @Get('merchant/ledger')
  @Roles(Role.MERCHANT)
  async getMerchantLedger(@Query('merchantId') merchantId: string) {
    return this.saasService.getMerchantLedger(merchantId);
  }

  @Post('merchant/payout/auto')
  @Roles(Role.MERCHANT)
  async updateAutoPayoutConfig(@Body() body: any) {
    return this.saasService.updateAutoPayoutConfig(body);
  }

  @Get('merchant/webhooks/logs')
  @Roles(Role.MERCHANT)
  async getMerchantWebhookLogs(@Query('merchantId') merchantId: string) {
    return this.saasService.getMerchantWebhookLogs(merchantId);
  }

  @Post('merchant/webhooks/retry')
  @Roles(Role.MERCHANT)
  async retryMerchantWebhook(@Body() payload: { logId: string }) {
    return this.saasService.retryMerchantWebhook(payload.logId);
  }
}
