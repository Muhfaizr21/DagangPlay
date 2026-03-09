import { Controller, Get, Put, Body, Param, UseGuards, Request, Post, Query } from '@nestjs/common';
import { ResellersService } from './resellers.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/resellers')
export class ResellersController {
    constructor(private readonly resellersService: ResellersService, private prisma: PrismaService) { }

    @Get()
    async getResellers(@Request() req, @Query('search') search?: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.resellersService.getResellers(merchant.id, search);
    }

    @Put(':id/status')
    async updateStatus(@Request() req, @Param('id') resellerId: string, @Body('status') status: UserStatus) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.resellersService.updateStatus(merchant.id, resellerId, status);
    }

    @Post(':id/balance')
    async adjustBalance(@Request() req, @Param('id') resellerId: string, @Body() body: { type: 'ADD' | 'SUBTRACT', amount: number, notes: string }) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.resellersService.adjustBalance(merchant.id, req.user.id, resellerId, body.type, body.amount, body.notes);
    }

    @Post()
    async createReseller(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant) throw new Error('Merchant not found');
        return this.resellersService.createReseller(merchant.id, body);
    }
}
