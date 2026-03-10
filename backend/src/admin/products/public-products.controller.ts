import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from './products.service';

@Controller('public/products')
export class PublicProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('categories')
    async getCategories() {
        return this.productsService.getPublicCategories();
    }

    @Get('categories/:slug')
    async getCategoryBySlug(@Param('slug') slug: string) {
        return this.productsService.getPublicCategoryBySlug(slug);
    }

    @Get('content')
    async getContent() {
        return this.productsService.getPublicContent();
    }

    @Get('reseller-prices')
    async getResellerPrices() {
        return this.productsService.getPublicResellerPrices();
    }

    @Get('full-catalog')
    async getFullCatalog() {
        return this.productsService.getPublicFullCatalog();
    }
}
