import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_merchants')
@Controller('admin/merchant-overrides')
export class MerchantOverridesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllOverrides() {
    return this.prisma.merchantProductPrice.findMany({
      include: {
        merchant: { select: { name: true, slug: true } },
        productSku: { select: { name: true, basePrice: true } },
        user: { select: { name: true } },
      },
    });
  }

  @Get('merchant/:merchantId')
  async getOverridesByMerchant(@Param('merchantId') merchantId: string) {
    return this.prisma.merchantProductPrice.findMany({
      where: { merchantId },
      include: { productSku: true },
    });
  }

  @Post()
  async createOverride(@Body() dto: any, @Req() req: any) {
    return this.prisma.merchantProductPrice.upsert({
      where: {
        merchantId_productSkuId: {
          merchantId: dto.merchantId,
          productSkuId: dto.productSkuId,
        },
      },
      update: {
        customModalPrice: dto.customModalPrice,
        reason: dto.reason,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
        isActive: true,
      },
      create: {
        merchantId: dto.merchantId,
        productSkuId: dto.productSkuId,
        customModalPrice: dto.customModalPrice,
        customPrice: dto.sellingPrice || 0, // Fallback if admin sets retail price too
        reason: dto.reason,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
        userId: req.user.id,
      },
    });
  }

  @Delete(':id')
  async deleteOverride(@Param('id') id: string) {
    return this.prisma.merchantProductPrice.delete({ where: { id } });
  }
}
