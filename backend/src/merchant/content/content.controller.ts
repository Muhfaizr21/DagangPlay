import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/content')
export class ContentController {
    constructor(private readonly contentService: ContentService, private prisma: PrismaService) { }

    @Get('banners')
    async getBanners(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.getBanners(merchant.id);
    }

    @Post('banners')
    async createBanner(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.createBanner(merchant.id, body);
    }

    @Put('banners/:id/toggle')
    async toggleBanner(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.toggleBanner(merchant.id, id, isActive);
    }

    @Delete('banners/:id')
    async deleteBanner(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.deleteBanner(merchant.id, id);
    }

    // Announcements
    @Get('announcements')
    async getAnnouncements(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.getAnnouncements(merchant.id);
    }

    @Post('announcements')
    async createAnnouncement(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.createAnnouncement(merchant.id, body);
    }

    @Put('announcements/:id/toggle')
    async toggleAnnouncement(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.toggleAnnouncement(merchant.id, id, isActive);
    }

    @Delete('announcements/:id')
    async deleteAnnouncement(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.deleteAnnouncement(merchant.id, id);
    }

    // Theme & Design
    @Put('design')
    async updateDesign(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.updateStoreDesign(merchant.id, body);
    }

    @Put('theme')
    async updateTheme(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.updateThemeSettings(merchant.id, body);
    }
}
