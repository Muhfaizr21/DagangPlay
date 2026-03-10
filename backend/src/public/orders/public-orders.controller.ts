import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { PublicOrdersService } from './public-orders.service';
import { TripayService } from '../../tripay/tripay.service';

@Controller('public/orders')
export class PublicOrdersController {
    constructor(
        private readonly publicOrdersService: PublicOrdersService,
        private readonly tripayService: TripayService
    ) { }

    @Get('payment-channels')
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }

    @Get('config')
    async getConfig(@Req() req: any) {
        const host = req.headers.host || req.headers.origin;
        return this.publicOrdersService.getStoreConfig(host);
    }

    @Post('checkout')
    async checkout(@Body() body: any, @Req() req: any) {
        const host = req.headers.host;
        const origin = req.headers.origin;
        return this.publicOrdersService.createCheckout(body, host, origin);
    }

    @Get(':orderNumber')
    async getOrder(@Param('orderNumber') orderNumber: string) {
        return this.publicOrdersService.getOrderDetails(orderNumber);
    }
}
