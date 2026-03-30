import { UseGuards, Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { SettingsService } from './settings.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { Permissions } from "../../auth/decorators/permissions.decorator";

import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_settings')
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    // Global Settings
    @Get('global')
    async getAllSettings() {
        return this.settingsService.getAllSettings();
    }

    // Global Settings (SUPER_ADMIN ONLY for safety)
    @Roles(Role.SUPER_ADMIN)
    @Put('global')
    async updateSettings(@Body() data: Record<string, string>) {
        return this.settingsService.updateSettings(data);
    }

    // Admin Team Management
    @Get('staff')
    async getAdminStaff() {
        return this.settingsService.getAdminStaff();
    }

    // Admin Team Management (SUPER_ADMIN ONLY)
    @Roles(Role.SUPER_ADMIN)
    @Post('staff')
    async createAdminStaff(@Body() data: CreateStaffDto) {
        return this.settingsService.createAdminStaff(data);
    }

    @Roles(Role.SUPER_ADMIN)
    @Put('staff/:id')
    async updateAdminStaff(@Param('id') id: string, @Body() data: UpdateStaffDto) {
        return this.settingsService.updateAdminStaff(id, data);
    }

    @Roles(Role.SUPER_ADMIN)
    @Delete('staff/:id')
    async deleteAdminStaff(@Param('id') id: string) {
        return this.settingsService.deleteAdminStaff(id);
    }

    // Job Queue Monitoring
    @Get('jobs')
    async getJobQueues(@Query('status') status?: string) {
        return this.settingsService.getJobQueues(status);
    }

    @Post('jobs/:id/retry')
    async retryFailedJob(@Param('id') id: string) {
        return this.settingsService.retryFailedJob(id);
    }
}
