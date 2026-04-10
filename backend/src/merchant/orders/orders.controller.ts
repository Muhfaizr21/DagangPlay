import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreateDirectOrderDto } from './dto/create-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private prisma: PrismaService,
  ) {}

  @Post('create-direct')
  async createDirectOrder(@Request() req, @Body() body: CreateDirectOrderDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.ordersService.createDirectOrder(merchant.id, req.user.id, body);
  }

  @Get()
  async getOrders(@Request() req, @Query() filters: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.ordersService.getOrders(merchant.id, filters);
  }

  @Get(':id')
  async getOrderDetails(@Request() req, @Param('id') orderId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.ordersService.getOrderDetails(merchant.id, orderId);
  }

  @Post(':id/retry')
  async retryOrder(@Request() req, @Param('id') orderId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.ordersService.retryOrder(merchant.id, orderId);
  }

  @Post(':id/refund')
  async refundOrder(
    @Request() req,
    @Param('id') orderId: string,
    @Body('reason') reason: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.ordersService.refundOrder(merchant.id, orderId, reason);
  }
}
