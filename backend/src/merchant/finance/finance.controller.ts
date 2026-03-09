import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT, Role.SUPER_ADMIN)
@Controller('merchant/finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService, private prisma: PrismaService) { }

    @Get()
    async getFinanceOverview(@Request() req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.financeService.getFinanceOverview(merchant.id, req.user.id);
    }

    @Post('withdraw')
    async requestWithdrawal(@Request() req, @Body() body: any) {
        return this.financeService.requestWithdrawal(req.user.id, body.amount, body.bankName, body.bankAccountName, body.bankAccountNumber);
    }

    @Post('deposit')
    async requestDeposit(@Request() req, @Body() body: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant) throw new Error('Merchant not found');
        return this.financeService.requestDeposit(merchant.id, req.user.id, body.amount, body.method);
    }
}
