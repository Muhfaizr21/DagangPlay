import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DigiflazzService } from './digiflazz.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Controller('admin/digiflazz')
export class DigiflazzController {
    constructor(private readonly digiflazzService: DigiflazzService) { }

    @Get('products')
    async getProductsList() {
        return this.digiflazzService.getDigiflazzProducts();
    }

    @Post('sync')
    async syncProduct(@Body() dto: any) {
        return this.digiflazzService.syncProduct(dto);
    }

    @Post('bulk-sync')
    async bulkSyncProducts(@Body() payload: any[]) {
        return this.digiflazzService.bulkSyncProducts(payload);
    }
}
