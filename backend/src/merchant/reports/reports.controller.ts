import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private prisma: PrismaService,
  ) {}

  @Get('sales')
  async getSalesPerformance(@Request() req, @Query() query: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.reportsService.getSalesPerformance(merchant.id, query);
  }

  @Get('products')
  async getProductPerformance(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.reportsService.getProductPerformance(merchant.id);
  }

  @Get('resellers')
  async getResellerPerformance(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.reportsService.getResellerPerformance(merchant.id);
  }
}
