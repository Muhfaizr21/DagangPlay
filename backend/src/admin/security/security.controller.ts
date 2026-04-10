import {
  UseGuards,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { SecurityService } from './security.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_security')
@Controller('admin/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('fraud')
  async getFraudDetections(@Query('riskLevel') riskLevel?: string) {
    return this.securityService.getFraudDetections(riskLevel);
  }

  @Post('fraud/:id/resolve')
  @HttpCode(200)
  async resolveFraud(@Param('id') id: string) {
    // Mock admin user ID since auth isn't wired perfectly in this component context yet
    return this.securityService.resolveFraud(id, 'SYSTEM_ADMIN');
  }

  @Get('blacklist')
  async getBlacklist() {
    return this.securityService.getBlacklistedIps();
  }

  @Post('blacklist')
  @HttpCode(201)
  async addBlacklist(@Body() data: { ipAddress: string; reason: string }) {
    return this.securityService.blacklistIp(
      data.ipAddress,
      data.reason,
      'SYSTEM_ADMIN',
    );
  }

  @Delete('blacklist/:id')
  async removeBlacklist(@Param('id') id: string) {
    return this.securityService.removeBlacklist(id);
  }

  @Get('login-attempts')
  async getLoginAttempts(@Query('limit') limit?: string) {
    return this.securityService.getLoginAttempts(limit ? parseInt(limit) : 50);
  }

  @Get('audit')
  async getAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('action') action?: string,
  ) {
    return this.securityService.getAuditLogs(startDate, action);
  }
}
