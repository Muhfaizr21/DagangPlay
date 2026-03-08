import { Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

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
}
