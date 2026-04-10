import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Query,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublicOrdersService } from './public-orders.service';
import { TripayService } from '../../tripay/tripay.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('public/orders')
export class PublicOrdersController {
  constructor(
    private readonly publicOrdersService: PublicOrdersService,
    private readonly tripayService: TripayService,
  ) {}

  @Get('payment-channels')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // Cache for 1 hour
  async getPaymentChannels() {
    return this.tripayService.getPaymentChannels();
  }

  @Get('merchants')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
  async getMerchants() {
    return this.publicOrdersService.getActiveMerchants();
  }

  @Get('resolve-domain')
  async resolveDomain(@Query('domain') domain: string) {
    if (!domain) throw new BadRequestException('Domain required');
    return this.publicOrdersService.resolveCustomDomain(domain);
  }

  @Get('config')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // Cache for 1 minute
  async getConfig(
    @Req() req: any,
    @Query('slug') merchantSlug?: string,
    @Query('domain') domainMask?: string,
  ) {
    const host = domainMask || req.headers.host || req.headers.origin;
    return this.publicOrdersService.getStoreConfig(host, merchantSlug);
  }

  @Get('status/:phone')
  async checkResellerStatus(
    @Param('phone') phone: string,
    @Query('merchantId') merchantId: string,
  ) {
    return this.publicOrdersService.checkResellerStatus(phone, merchantId);
  }

  @Post('otp/send')
  async sendOtp(@Body() body: any) {
    return this.publicOrdersService.sendResellerOtp(
      body.phone,
      body.merchantId,
    );
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: any) {
    return this.publicOrdersService.verifyResellerOtp(
      body.phone,
      body.merchantId,
      body.code,
    );
  }

  @Post('checkout')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async checkout(@Body() body: any, @Req() req: any) {
    const host = body.domain || req.headers.host;
    const origin = req.headers.origin;
    const merchantSlug = body.merchant;
    return this.publicOrdersService.createCheckout(
      body,
      host,
      origin,
      merchantSlug,
    );
  }

  @Get('search')
  async searchOrders(@Query('phone') phone?: string) {
    if (!phone) throw new BadRequestException('Nomor WhatsApp diperlukan');
    return this.publicOrdersService.findOrdersByWhatsApp(phone);
  }

  @Get('validate-nickname')
  async validateNickname(
    @Query('productId') productId: string,
    @Query('gameId') gameId: string,
    @Query('serverId') serverId?: string,
  ) {
    if (!productId || !gameId)
      throw new BadRequestException('Produk ID dan Game ID wajib diisi');
    return this.publicOrdersService.validateNickname(
      productId,
      gameId,
      serverId,
    );
  }

  @Get(':orderNumber')
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.publicOrdersService.getOrderDetails(orderNumber);
  }
}
