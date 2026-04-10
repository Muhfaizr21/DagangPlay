import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getStatus(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant)
      throw new NotFoundException(
        'Data profil merchant tidak ditemukan di sistem.',
      );
    return this.subscriptionService.getSubscriptionStatus(merchant.id);
  }

  @Get('invoices')
  async getInvoices(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant)
      throw new NotFoundException('Daftar tagihan tidak ditemukan.');
    return this.subscriptionService.getInvoiceHistory(merchant.id);
  }

  @Post('invoices')
  async createInvoice(@Request() req, @Body() body: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant)
      throw new NotFoundException('Aksi ditolak: Merchant tidak valid.');
    return this.subscriptionService.createInvoice(merchant.id, body);
  }

  @Put('invoices/:id/proof')
  async uploadProof(
    @Request() req,
    @Param('id') id: string,
    @Body('proofUrl') proofUrl: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant)
      throw new NotFoundException(
        'Aksi ditolak: Identitas merchant tidak ditemukan.',
      );
    return this.subscriptionService.uploadProof(merchant.id, id, proofUrl);
  }
}
