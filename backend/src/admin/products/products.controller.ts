import { UseGuards, Controller, Get, Post, Body, Param, Patch } from "@nestjs/common";
import { ProductsService } from './products.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Controller('admin/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('categories')
    async getCategories() {
        return this.productsService.getCategories();
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
        @Body() prices: { normal: number, pro: number, legend: number, supreme: number }
    ) {
        return this.productsService.updateSkuPrice(id, prices);
    }

    @Post('skus/bulk-formula')
    async applyCategoryFormula(
        @Body() body: { categoryId: string, margins: { normal: number, pro: number, legend: number, supreme: number } }
    ) {
        return this.productsService.applyCategoryFormula(body.categoryId, body.margins);
    }
}
