import { Controller, Get, UseGuards, Request, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getDashboardData(@Request() req) {
        // req.user is set by JwtAuthGuard parsing the JWT bearer token
        return this.dashboardService.getDashboardData(req.user.id);
    }

    @Get('export-report')
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment; filename=merchant-dashboard-report.csv')
    async exportReport(@Request() req, @Res() res: Response) {
        const csv = await this.dashboardService.getDashboardReport(req.user.id);
        return res.send(csv);
    }
}
