import { Controller, Post, Body, Get, Param, Req, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
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
    async getConfig(@Req() req: any, @Query('slug') merchantSlug?: string, @Query('domain') domainMask?: string) {
        const host = domainMask || req.headers.host || req.headers.origin;
        return this.publicOrdersService.getStoreConfig(host, merchantSlug);
    }

    @Post('checkout')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async checkout(@Body() body: any, @Req() req: any) {
        const host = req.headers.host;
        const origin = req.headers.origin;
        const merchantSlug = body.merchant;
        return this.publicOrdersService.createCheckout(body, host, origin, merchantSlug);
    }

    @Get(':orderNumber')
    async getOrder(@Param('orderNumber') orderNumber: string) {
        return this.publicOrdersService.getOrderDetails(orderNumber);
    }
}
