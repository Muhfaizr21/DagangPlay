import { Controller, Get, Query, Patch, Param, Body, BadRequestException, Post } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantStatus } from '@prisma/client';

@Controller('admin/merchants')
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) { }

    @Get()
    async getMerchants(@Query('search') search?: string, @Query('status') status?: string) {
        return this.merchantsService.getAllMerchants(search, status);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: MerchantStatus, @Body('reason') reason?: string) {
        if (!status) throw new BadRequestException('Status is required');
        return this.merchantsService.setMerchantStatus(id, status, reason);
    }

    @Get(':id')
    async getMerchantDetail(@Param('id') id: string) {
        return this.merchantsService.getMerchantDetail(id);
    }

    @Patch(':id/settings')
    async updateSettings(@Param('id') id: string, @Body() body: any) {
        return this.merchantsService.updateMerchantSettings(id, body);
    }

    @Post(':id/reset-password')
    async resetOwnerPassword(@Param('id') id: string) {
        return this.merchantsService.resetOwnerPassword(id);
    }
}
