import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PromosService } from './promos.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/promos')
export class PromosController {
    constructor(private readonly promosService: PromosService, private prisma: PrismaService) { }

    @Get()
    async getPromos(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.getPromos(merchant.id);
    }

    @Post()
    async createPromo(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.createPromo(merchant.id, body);
    }

    @Put(':id/toggle')
    async togglePromo(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.togglePromo(merchant.id, id, isActive);
    }

    @Delete(':id')
    async deletePromo(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.deletePromo(merchant.id, id);
    }

    // --- FLASH SALE ENDPOINTS ---
    @Get('flash-sales')
    async getFlashSales(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.getFlashSales(merchant.id);
    }

    @Post('flash-sales')
    async createFlashSale(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.createFlashSale(merchant.id, body);
    }

    @Put('flash-sales/:id/toggle')
    async toggleFlashSale(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.toggleFlashSale(merchant.id, id, isActive);
    }

    @Delete('flash-sales/:id')
    async deleteFlashSale(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.promosService.deleteFlashSale(merchant.id, id);
    }
}
