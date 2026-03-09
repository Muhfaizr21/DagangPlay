import { Controller, Get, Put, Body, Param, UseGuards, Request, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService, private prisma: PrismaService) { }

    @Get()
    async getSettings(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.getSettings(merchant.id);
    }

    @Put('profile')
    async updateProfile(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.updateProfile(merchant.id, body);
    }

    @Put('domain')
    async updateDomain(@Request() req, @Body('domain') domain: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.updateDomain(merchant.id, domain);
    }

    @Get('payment-channels')
    async getPaymentChannels(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.getPaymentChannels(merchant.id);
    }

    @Put('payment-channels/:id/toggle')
    async togglePaymentChannel(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.togglePaymentChannel(merchant.id, id, isActive);
    }

    @Get('webhooks')
    async getWebhooks(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.getWebhooks(merchant.id);
    }

    @Post('webhooks')
    async updateWebhook(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.settingsService.updateWebhook(merchant.id, body);
    }
}
