import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_settings')
@Controller('admin/plan-tier-mappings')
export class PlanMappingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getMappings() {
    return this.prisma.planTierMapping.findMany();
  }

  @Post('sync')
  async syncDefaultMappings() {
    const defaults = [
      { plan: 'FREE', tier: 'NORMAL' },
      { plan: 'PRO', tier: 'PRO' },
      { plan: 'LEGEND', tier: 'LEGEND' },
      { plan: 'SUPREME', tier: 'SUPREME' },
    ];

    for (const item of defaults) {
      await this.prisma.planTierMapping.upsert({
        where: { plan: item.plan as any },
        update: { tier: item.tier as any },
        create: {
          plan: item.plan as any,
          tier: item.tier as any,
          updatedBy: 'system',
        },
      });
    }
    return { success: true };
  }

  @Post()
  async updateMapping(@Body() dto: any) {
    return this.prisma.planTierMapping.upsert({
      where: { plan: dto.plan },
      update: { tier: dto.tier, updatedBy: 'admin' },
      create: { plan: dto.plan, tier: dto.tier, updatedBy: 'admin' },
    });
  }
}
