import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from './products.service';

@Controller('public/products')
export class PublicProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('categories')
    async getCategories(@Query('merchant') merchantSlug?: string) {
        return this.productsService.getPublicCategories(merchantSlug);
    }

    @Get('categories/:slug')
    async getCategoryBySlug(@Param('slug') slug: string, @Query('merchant') merchantSlug?: string) {
        return this.productsService.getPublicCategoryBySlug(slug, merchantSlug);
    }

    @Get('content')
    async getContent(@Query('merchant') merchantSlug?: string) {
        return this.productsService.getPublicContent(merchantSlug);
    }

    @Get('reseller-prices')
    async getResellerPrices(@Query('merchant') merchantSlug?: string) {
        return this.productsService.getPublicResellerPrices(merchantSlug);
    }

    @Get('full-catalog')
    async getFullCatalog(@Query('merchant') merchantSlug?: string) {
        return this.productsService.getPublicFullCatalog(merchantSlug);
    }
}
