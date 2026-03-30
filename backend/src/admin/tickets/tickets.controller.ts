import { UseGuards,  Controller, Get, Post, Put, Body, Param, Query, HttpCode  } from "@nestjs/common";
import { TicketsService } from './tickets.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { Permissions } from "../../auth/decorators/permissions.decorator";

import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_tickets')
@Controller('admin/tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    async getTickets(
        @Query('status') status?: string,
        @Query('category') category?: string,
        @Query('priority') priority?: string,
        @Query('merchantId') merchantId?: string
    ) {
        return this.ticketsService.getTickets({ status, category, priority, merchantId });
    }

    @Get('stats')
    async getStats() {
        return this.ticketsService.getStats();
    }

    @Get(':id')
    async getTicketDetails(@Param('id') id: string) {
        return this.ticketsService.getTicketDetails(id);
    }

    @Put(':id')
    async updateTicket(
        @Param('id') id: string,
        @Body() body: { status?: string, priority?: string, assignedToId?: string }
    ) {
        return this.ticketsService.updateTicket(id, body as any);
    }

    @Post(':id/reply')
    @HttpCode(201)
    async replyTicket(
        @Param('id') id: string,
        @Body() body: { message: string, attachmentUrl?: string }
    ) {
        // Mock admin user ID since auth context isn't perfectly mapped
        const dummyAdminUserId = 'clq1234dummyadmin'; // Ideally from req.user
        return this.ticketsService.replyTicket(id, dummyAdminUserId, body.message, body.attachmentUrl);
    }
}
