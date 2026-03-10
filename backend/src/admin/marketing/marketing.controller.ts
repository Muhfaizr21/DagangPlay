import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role, MerchantPlan } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/marketing')
export class MarketingController {
    constructor(private readonly marketingService: MarketingService) { }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
    @Get('guides')
    async getGuides(
        @Query('search') search?: string,
        @Query('plan') plan?: MerchantPlan
    ) {
        return this.marketingService.getAllGuides(search, plan);
    }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
    @Get('guides/:id')
    async getGuide(@Param('id') id: string) {
        return this.marketingService.getGuideById(id);
    }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
    @Post('guides')
    async createGuide(@Body() data: any) {
        return this.marketingService.createGuide(data);
    }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
    @Patch('guides/:id')
    async updateGuide(@Param('id') id: string, @Body() data: any) {
        return this.marketingService.updateGuide(id, data);
    }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
    @Delete('guides/:id')
    @HttpCode(204)
    async deleteGuide(@Param('id') id: string) {
        return this.marketingService.deleteGuide(id);
    }

    // MERCHANT SIDE
    @Roles(Role.MERCHANT)
    @Get('my-guides')
    async getMerchantGuides(@Req() req: any) {
        // We need to find the merchantId from the logged in user
        // Assuming req.user.merchantId exists or we find it
        const user = await this.marketingService.getGuidesForMerchant(req.user.merchantId);
        return user;
    }
}
