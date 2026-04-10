import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_products')
@Controller('admin/pricing-rules')
export class PricingRulesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('categories')
  async getCategoryRules() {
    return this.prisma.tierPricingRule.findMany({
      include: { category: true },
    });
  }

  @Post('categories')
  async createCategoryRule(@Body() dto: any) {
    return this.prisma.tierPricingRule.create({
      data: {
        categoryId: dto.categoryId === 'global' ? null : dto.categoryId,
        marginNormal: dto.marginNormal,
        marginPro: dto.marginPro,
        marginLegend: dto.marginLegend,
        marginSupreme: dto.marginSupreme,
        createdBy: 'admin',
      },
    });
  }

  @Patch('categories/:id')
  async updateCategoryRule(@Param('id') id: string, @Body() dto: any) {
    return this.prisma.tierPricingRule.update({
      where: { id },
      data: dto,
    });
  }

  @Delete('categories/:id')
  async deleteCategoryRule(@Param('id') id: string) {
    return this.prisma.tierPricingRule.delete({ where: { id } });
  }

  @Post('apply-category/:categoryId')
  async applyCategoryRule(
    @Param('categoryId') categoryId: string,
    @Body() margins: any,
  ) {
    return this.productsService.applyCategoryFormula(categoryId, margins);
  }
}
