import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import sharp from 'sharp';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/content')
export class ContentController {
    constructor(private readonly contentService: ContentService, private prisma: PrismaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new HttpException('File not found', HttpStatus.BAD_REQUEST);

        const uploadDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${uuidv4()}.webp`;
        const filePath = join(uploadDir, filename);

        try {
            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(filePath);

            return {
                message: 'Image uploaded successfully',
                url: `/uploads/${filename}`
            };
        } catch (error) {
            console.error(error);
            throw new HttpException('Error processing image', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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

    @Put('banners/:id')
    async updateBanner(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.updateBanner(merchant.id, id, body);
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

    @Put('announcements/:id')
    async updateAnnouncement(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.updateAnnouncement(merchant.id, id, body);
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

    // Popup Promos
    @Get('popup-promos')
    async getPopupPromos(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.getPopupPromos(merchant.id);
    }

    @Post('popup-promos')
    async createPopupPromo(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.createPopupPromo(merchant.id, body);
    }

    @Put('popup-promos/:id/toggle')
    async togglePopupPromo(@Request() req, @Param('id') id: string, @Body('isActive') isActive: boolean) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.togglePopupPromo(merchant.id, id, isActive);
    }

    @Put('popup-promos/:id')
    async updatePopupPromo(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.updatePopupPromo(merchant.id, id, body);
    }

    @Delete('popup-promos/:id')
    async deletePopupPromo(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.contentService.deletePopupPromo(merchant.id, id);
    }
}
