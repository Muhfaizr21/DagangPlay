import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/commissions')
export class CommissionsController {
  constructor(
    private readonly commissionsService: CommissionsService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getCommissions(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.commissionsService.getCommissions(merchant.id);
  }

  @Post('settle')
  async settleAllCommissions(@Request() req) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.commissionsService.settleCommissions(merchant.id);
  }

  @Post('settle/:resellerId')
  async settleResellerCommissions(
    @Request() req,
    @Param('resellerId') resellerId: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { ownerId: req.user.id },
    });
    if (!merchant) throw new Error('Merchant not found');
    return this.commissionsService.settleCommissions(merchant.id, resellerId);
  }
}
