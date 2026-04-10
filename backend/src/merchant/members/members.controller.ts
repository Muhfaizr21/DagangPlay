import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Post,
  Query,
  Patch,
  Put,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getMembers(
    @Request() req,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.membersService.getAllUsers(merchant.id, search, role);
  }

  @Post()
  async createMember(
    @Request() req,
    @Body() data: { name: string; phone: string; balance?: number },
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.membersService.createManualUser(merchant.id, data);
  }

  @Put(':id')
  async updateMember(
    @Request() req,
    @Param('id') userId: string,
    @Body() data: { name: string; phone: string },
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.membersService.updateUser(merchant.id, userId, data);
  }

  @Patch(':id/role')
  async toggleRole(
    @Request() req,
    @Param('id') userId: string,
    @Body('role') targetRole: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.membersService.toggleResellerStatus(
      merchant.id,
      userId,
      targetRole as Role,
    );
  }

  @Get('ranking')
  async getRanking(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.membersService.getTopResellers(merchant.id);
  }
}
