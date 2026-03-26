import { Controller, Get, Put, Query, Body, Param, UseGuards, Request, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService, private prisma: PrismaService) { }

    @Get('categories')
    async getCategories() {
        return this.prisma.category.findMany({
            where: { isActive: true, products: { some: { status: 'ACTIVE' } } },
            select: { id: true, name: true, slug: true, image: true },
            orderBy: { name: 'asc' }
        });
    }

    @Get()
    async getProducts(@Request() req, @Query('search') search?: string, @Query('categoryId') categoryId?: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.productsService.getProducts(merchant.id, search, categoryId);
    }

    @Put(':skuId/price')
    async updateSkuPrice(@Request() req, @Param('skuId') skuId: string, @Body() body: { sellingPrice: number, isActive: boolean }) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.productsService.updateSkuPriceOverrides(merchant.id, req.user.id, skuId, body.sellingPrice, body.isActive);
    }

    @Post('bulk-update')
    async bulkUpdatePricing(@Request() req, @Body() body: { markupPercentage: number; markupAmount?: number; categoryId?: string }) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.productsService.bulkUpdateMargin(merchant.id, req.user.id, body.markupPercentage, body.markupAmount || 0, body.categoryId);
    }

    @Put(':productId/metadata')
    async updateProductMetadata(@Request() req, @Param('productId') productId: string, @Body() body: { customName?: string, customThumbnail?: string, description?: string }) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.productsService.updateProductOverride(merchant.id, productId, body);
    }
}
