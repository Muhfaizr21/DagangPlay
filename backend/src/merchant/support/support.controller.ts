import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/support')
export class SupportController {
    constructor(private readonly supportService: SupportService, private prisma: PrismaService) { }

    @Get()
    async getTickets(@Request() req, @Query() filters: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.supportService.getTickets(merchant.id, filters);
    }

    @Get(':id')
    async getTicketDetails(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.supportService.getTicketDetails(merchant.id, id);
    }

    @Post(':id/reply')
    async replyTicket(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.supportService.replyTicket(merchant.id, id, req.user.id, body.message, body.attachments);
    }

    @Put(':id')
    async updateTicket(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.supportService.updateTicket(merchant.id, id, body);
    }
}
