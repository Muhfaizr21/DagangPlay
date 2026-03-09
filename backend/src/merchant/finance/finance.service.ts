import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async getFinanceOverview(merchantId: string, ownerId: string) {
        const orders = await this.prisma.order.findMany({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', paymentStatus: 'PAID' },
            select: { totalPrice: true }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

        const deposits = await this.prisma.deposit.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const withdrawals = await this.prisma.withdrawal.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return {
            balance: totalRevenue,
            deposits,
            withdrawals
        };
    }

    async requestWithdrawal(ownerId: string, amount: number, bankName: string, bankAccountName: string, bankAccountNumber: string) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        return this.prisma.withdrawal.create({
            data: {
                userId: ownerId,
                amount,
                fee: 0,
                netAmount: amount,
                bankName,
                bankAccountName,
                bankAccountNumber,
                status: 'PENDING',
            }
        });
    }

    async requestDeposit(merchantId: string, ownerId: string, amount: number, method: PaymentMethod, provider: PaymentProvider) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        return this.prisma.deposit.create({
            data: {
                userId: ownerId,
                merchantId,
                amount,
                method,
                provider,
                status: 'PENDING'
            }
        });
    }
}
