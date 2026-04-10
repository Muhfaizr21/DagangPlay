import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_products')
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Patch('categories/:name/image')
  async updateCategoryImage(
    @Param('name') name: string,
    @Body() body: { imageUrl: string },
  ) {
    return this.productsService.updateCategoryImage(name, body.imageUrl);
  }

  @Get()
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Post('sync')
  async syncDigiflazz() {
    return this.productsService.syncDigiflazzProducts();
  }

  @Get('skus/pricing')
  async getAllSkusPricing() {
    return this.productsService.getAllSkusPricing();
  }

  @Patch('skus/:id/price')
  async updateSkuPrice(
    @Param('id') id: string,
    @Body()
    prices: { normal: number; pro: number; legend: number; supreme: number },
  ) {
    return this.productsService.updateSkuPrice(id, prices);
  }

  @Post('skus/bulk-formula')
  async applyCategoryFormula(
    @Body()
    body: {
      categoryId: string;
      margins: { normal: number; pro: number; legend: number; supreme: number };
    },
  ) {
    return this.productsService.applyCategoryFormula(
      body.categoryId,
      body.margins,
    );
  }

  @Patch('skus/:id/status')
  async updateSkuStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.productsService.updateSkuStatus(id, body.status);
  }
}
