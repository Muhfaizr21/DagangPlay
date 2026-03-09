import { Controller, Post, Body, Get } from '@nestjs/common';
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

    @Post('checkout')
    async checkout(@Body() body: any) {
        return this.publicOrdersService.createCheckout(body);
    }
}
