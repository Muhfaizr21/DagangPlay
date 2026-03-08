import { Controller, Get, Query, Patch, Param, Body, BadRequestException } from '@nestjs/common';
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
}
