import { Controller, Get, Patch, Post, Param, Body, Query, HttpCode } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';

@Controller('admin/transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    async getAllTransactions(
        @Query('search') search?: string,
        @Query('paymentStatus') paymentStatus?: string,
        @Query('fulfillmentStatus') fulfillmentStatus?: string,
        @Query('merchantId') merchantId?: string,
        @Query('resellerId') resellerId?: string,
        @Query('productId') productId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.transactionsService.getAllTransactions({
            search, paymentStatus, fulfillmentStatus, merchantId, resellerId, productId, startDate, endDate
        });
    }

    @Get(':id')
    async getTransactionDetail(@Param('id') id: string) {
        return this.transactionsService.getTransactionDetail(id);
    }

    @Post(':id/retry')
    @HttpCode(200)
    async retryTransaction(@Param('id') id: string) {
        // mock operator
        return this.transactionsService.retryTransaction(id, 'SuperAdmin');
    }

    @Post(':id/refund')
    @HttpCode(200)
    async refundTransaction(@Param('id') id: string) {
        return this.transactionsService.refundTransaction(id, 'SuperAdmin');
    }

    @Post(':id/mark-fraud')
    @HttpCode(200)
    async markAsFraud(
        @Param('id') id: string,
        @Body() body: { reason: string }
    ) {
        return this.transactionsService.markAsFraud(id, body.reason, 'SuperAdmin');
    }

    @Patch(':id/status/override')
    @HttpCode(200)
    async overrideStatus(
        @Param('id') id: string,
        @Body() body: { fulfillmentStatus: OrderFulfillmentStatus; paymentStatus: OrderPaymentStatus; reason: string }
    ) {
        return this.transactionsService.overrideStatus(id, body.fulfillmentStatus, body.paymentStatus, body.reason, 'SuperAdmin');
    }
}
