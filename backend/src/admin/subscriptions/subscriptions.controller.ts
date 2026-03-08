import { UseGuards,  Controller, Get, Post, Patch, Body, Param, Query, HttpCode  } from "@nestjs/common";
import { SubscriptionsService } from './subscriptions.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Controller('admin/subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Get('invoices')
    async getInvoices(
        @Query('search') search?: string,
        @Query('status') status?: string
    ) {
        return this.subscriptionsService.getInvoices(search, status);
    }

    @Post('invoices/:id/confirm')
    @HttpCode(200)
    async confirmInvoice(@Param('id') id: string) {
        return this.subscriptionsService.confirmInvoice(id, 'SuperAdmin');
    }

    @Post('invoices/:id/reject')
    @HttpCode(200)
    async rejectInvoice(@Param('id') id: string, @Body('notes') notes: string) {
        return this.subscriptionsService.rejectInvoice(id, notes);
    }

    @Post('merchants/:id/adjust')
    @HttpCode(200)
    async adjustMerchant(
        @Param('id') id: string,
        @Body('plan') plan: string,
        @Body('days') days: number
    ) {
        return this.subscriptionsService.updateMerchantPlanManual(id, plan, days, 'SuperAdmin');
    }

    @Get('plans/features')
    async getFeatures() {
        return this.subscriptionsService.getPlanFeatures();
    }

    @Post('plans/features')
    @HttpCode(200)
    async updateFeatures(@Body() features: any) {
        return this.subscriptionsService.updatePlanFeatures(features, 'SuperAdmin');
    }

    @Get('performance')
    async getPerformance() {
        return this.subscriptionsService.getSaaSPerformance();
    }

    @Post('invoices/manual')
    @HttpCode(201)
    async createManualInvoice(
        @Body('merchantId') merchantId: string,
        @Body('plan') plan: any,
        @Body('amount') amount: number,
        @Body('dueDate') dueDate: Date
    ) {
        return this.subscriptionsService.createManualInvoice(merchantId, plan, amount, dueDate, 'SuperAdmin');
    }
}
