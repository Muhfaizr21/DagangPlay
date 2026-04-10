import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private prisma: PrismaService,
  ) {}

  // --- Merchant Endpoints ---
  @Roles(Role.MERCHANT)
  @Get('merchant')
  async getMerchantChat(@Req() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant profile not found');
    return this.chatService.getMerchantChat(merchant.id);
  }

  @Roles(Role.MERCHANT)
  @Post('merchant/send')
  async sendMessageFromMerchant(@Req() req, @Body() body: { message: string }) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant profile not found');
    return this.chatService.sendMessageFromMerchant(
      merchant.id,
      req.user.id,
      body.message,
    );
  }

  // --- Admin Endpoints ---
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
  @Get('admin/rooms')
  async getAllRooms() {
    return this.chatService.getAllRooms();
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
  @Get('admin/rooms/:id')
  async getRoomMessages(@Param('id') id: string) {
    return this.chatService.getRoomMessages(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
  @Post('admin/rooms/:id/send')
  async sendMessageFromAdmin(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { message: string },
  ) {
    return this.chatService.sendMessageFromAdmin(id, req.user.id, body.message);
  }
}
