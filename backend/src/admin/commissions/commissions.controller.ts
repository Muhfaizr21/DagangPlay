import { UseGuards,  Controller, Get, Post, Body, Param, Query, HttpCode  } from "@nestjs/common";
import { CommissionsService } from './commissions.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Controller('admin/commissions')
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) { }

    // =====================
    // LEVELS
    // =====================
    @Get('levels')
    async getLevels() {
        return this.commissionsService.getResellerLevels();
    }

    @Post('levels')
    async createLevel(@Body() body: any) {
        return this.commissionsService.createResellerLevel(body);
    }

    // =====================
    // COMMISSIONS
    // =====================
    @Get('pending')
    async getPending(@Query('search') search?: string) {
        return this.commissionsService.getPendingCommissions(search);
    }

    @Post(':id/settle')
    @HttpCode(200)
    async settle(@Param('id') id: string) {
        // In real app, extract actual logged in user ID
        return this.commissionsService.settleCommission(id, 'SuperAdmin');
    }

    @Post('bulk-settle')
    @HttpCode(200)
    async bulkSettle() {
        return this.commissionsService.settleBulkCommissions('SuperAdmin');
    }

    // =====================
    // MLM TREE
    // =====================
    @Get('tree')
    async getTree(@Query('userId') userId?: string) {
        return this.commissionsService.getDownlineTree(userId);
    }
}
