import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SupplierStatus } from '@prisma/client';

@Controller('admin/suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @Get()
    async getAllSuppliers() {
        return this.suppliersService.getAllSuppliers();
    }

    @Get(':id')
    async getSupplierById(@Param('id') id: string) {
        return this.suppliersService.getSupplierById(id);
    }

    @Patch(':id')
    async updateSupplier(
        @Param('id') id: string,
        @Body() data: { name?: string; apiUrl?: string; apiKey?: string; apiSecret?: string; status?: SupplierStatus }
    ) {
        return this.suppliersService.updateSupplier(id, data);
    }

    @Post(':id/test-connection')
    async testConnection(@Param('id') id: string) {
        return this.suppliersService.testConnection(id);
    }

    @Post(':id/topup')
    async topupBalance(@Param('id') id: string, @Body() data: { amount: number; note?: string }) {
        if (!data.amount || data.amount <= 0) {
            throw new Error('Amount re-topup invalid');
        }
        return this.suppliersService.topupBalance(id, data.amount, data.note);
    }

    @Get(':id/logs')
    async getLogs(@Param('id') id: string) {
        return this.suppliersService.getSupplierLogs(id);
    }

    @Get(':id/balance-history')
    async getBalanceHistory(@Param('id') id: string) {
        return this.suppliersService.getSupplierBalanceHistories(id);
    }
}
