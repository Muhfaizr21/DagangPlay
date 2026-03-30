import { UseGuards,  Controller, Get  } from "@nestjs/common";
import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { Permissions } from "../../auth/decorators/permissions.decorator";

import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_dashboard')
@Controller('admin/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    async getDashboardSummary() {
        return this.dashboardService.getDashboardSummary();
    }
}
