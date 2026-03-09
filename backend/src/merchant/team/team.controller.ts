import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/team')
export class TeamController {
    constructor(private readonly teamService: TeamService, private prisma: PrismaService) { }

    @Get()
    async getTeamMembers(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.teamService.getTeamMembers(merchant.id);
    }

    @Post()
    async addTeamMember(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.teamService.addTeamMember(merchant.id, body);
    }

    @Put(':id')
    async updateTeamMember(@Request() req, @Param('id') id: string, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.teamService.updateTeamMember(merchant.id, id, body);
    }

    @Delete(':id')
    async removeTeamMember(@Request() req, @Param('id') id: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.teamService.removeTeamMember(merchant.id, id);
    }
}
