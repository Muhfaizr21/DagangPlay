import { UseGuards,  Controller, Get, Post  } from "@nestjs/common";
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
}
