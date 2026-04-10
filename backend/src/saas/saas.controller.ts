import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { SaasService } from './saas.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Permissions('manage_saas')
@Controller('saas')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
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
  async getMerchantLedger(
    @Req() req: any,
    @Query('merchantId') merchantId: string,
  ) {
    // ENFORCE MULTI-TENANT ISOLATION
    if (req.user.merchantId !== merchantId) {
      throw new ForbiddenException('Unauthorized access to this ledger');
    }
    return this.saasService.getMerchantLedger(merchantId);
  }

  @Post('merchant/payout/auto')
  @Roles(Role.MERCHANT)
  async updateAutoPayoutConfig(@Req() req: any, @Body() body: any) {
    // ENFORCE MULTI-TENANT ISOLATION
    const merchantId = req.user.merchantId;
    return this.saasService.updateAutoPayoutConfig({
      ...body,
      merchantId, // Override any merchantId sent in body with the authenticated one
    });
  }

  @Get('merchant/webhooks/logs')
  @Roles(Role.MERCHANT)
  async getMerchantWebhookLogs(
    @Req() req: any,
    @Query('merchantId') merchantId: string,
  ) {
    // ENFORCE MULTI-TENANT ISOLATION
    if (req.user.merchantId !== merchantId) {
      throw new ForbiddenException('Unauthorized access to these logs');
    }
    return this.saasService.getMerchantWebhookLogs(merchantId);
  }

  @Post('merchant/webhooks/retry')
  @Roles(Role.MERCHANT)
  async retryMerchantWebhook(
    @Req() req: any,
    @Body() payload: { logId: string },
  ) {
    // ENFORCE MULTI-TENANT ISOLATION
    const merchantId = req.user.merchantId;
    return this.saasService.retryMerchantWebhook(payload.logId, merchantId);
  }
}
