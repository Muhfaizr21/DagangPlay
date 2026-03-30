import { UseGuards,  Controller, Get, Post, Put, Delete, Body, Param, HttpCode  } from "@nestjs/common";
import { ContentService } from './content.service';
import { NotificationType, NotificationChannel } from '@prisma/client';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { Permissions } from "../../auth/decorators/permissions.decorator";

import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_content')
@Controller('admin/content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Get('banners')
    async getBanners() {
        return this.contentService.getBanners();
    }

    @Post('banners')
    @HttpCode(201)
    async createBanner(@Body() data: any) {
        return this.contentService.createBanner(data);
    }

    @Put('banners/:id')
    async updateBanner(@Param('id') id: string, @Body() data: any) {
        return this.contentService.updateBanner(id, data);
    }

    @Delete('banners/:id')
    async deleteBanner(@Param('id') id: string) {
        return this.contentService.deleteBanner(id);
    }

    @Post('banners/:id/toggle')
    @HttpCode(200)
    async toggleBanner(@Param('id') id: string) {
        return this.contentService.turnOffBanner(id);
    }

    @Get('announcements')
    async getAnnouncements() {
        return this.contentService.getAnnouncements();
    }

    @Post('announcements')
    @HttpCode(201)
    async createAnnouncement(@Body() data: any) {
        return this.contentService.createAnnouncement(data);
    }

    @Put('announcements/:id')
    async updateAnnouncement(@Param('id') id: string, @Body() data: any) {
        return this.contentService.updateAnnouncement(id, data);
    }

    @Delete('announcements/:id')
    async deleteAnnouncement(@Param('id') id: string) {
        return this.contentService.deleteAnnouncement(id);
    }

    @Post('announcements/:id/toggle')
    @HttpCode(200)
    async toggleAnnouncement(@Param('id') id: string) {
        return this.contentService.toggleAnnouncement(id);
    }

    @Get('templates')
    async getTemplates() {
        return this.contentService.getTemplates();
    }

    @Post('templates')
    @HttpCode(200)
    async saveTemplate(
        @Body('type') type: string,
        @Body('channel') channel: string,
        @Body() data: any
    ) {
        return this.contentService.saveTemplate(
            type as NotificationType,
            channel as NotificationChannel,
            data
        );
    }

    @Get('broadcasts')
    async getBroadcasts() {
        return this.contentService.getCampaigns();
    }

    @Post('broadcasts')
    @HttpCode(201)
    async createBroadcast(@Body() data: any) {
        return this.contentService.createCampaign(data);
    }
}
