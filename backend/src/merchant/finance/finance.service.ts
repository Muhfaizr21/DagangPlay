import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaymentMethod } from '@prisma/client';
import { TripayService } from '../../tripay/tripay.service';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService, private tripay: TripayService) { }

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

        const user = await this.prisma.user.findUnique({
            where: { id: ownerId },
            select: { balance: true }
        });

        return {
            balance: user?.balance || 0,
            revenue: totalRevenue,
            deposits,
            withdrawals
        };
    }

    async requestWithdrawal(ownerId: string, amount: number, bankName: string, bankAccountName: string, bankAccountNumber: string, isInstant?: boolean) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        const balanceUser = await this.prisma.user.findUnique({ where: { id: ownerId } });
        if (!balanceUser || balanceUser.balance < amount) {
            throw new BadRequestException('Saldo tidak mencukupi untuk penarikan ini');
        }

        const withdrawal = await this.prisma.withdrawal.create({
            data: {
                userId: ownerId,
                amount,
                fee: isInstant ? 5000 : 0, // Mock fee for instant
                netAmount: isInstant ? amount - 5000 : amount,
                bankName,
                bankAccountName,
                bankAccountNumber,
                status: isInstant ? 'COMPLETED' : 'PENDING',
                note: isInstant ? 'Dicarikan instan otomatis oleh sistem' : undefined
            }
        });

        if (isInstant) {
            await this.prisma.user.update({
                where: { id: ownerId },
                data: { balance: { decrement: amount } }
            });
            // We should ideally deduct from Super Admin's bank in real world via API.
            // For now, this marks it completed.
        }

        return withdrawal;
    }

    async requestDeposit(merchantId: string, ownerId: string, amount: number, method: string) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        // Map frontend method code to Tripay code & Prisma enum
        const methodMapping: Record<string, { tripay: string, prisma: PaymentMethod }> = {
            'QRIS': { tripay: 'QRISC', prisma: 'TRIPAY_QRIS' },
            'BCAVA': { tripay: 'BCAVA', prisma: 'TRIPAY_VA_BCA' },
            'BNIVA': { tripay: 'BNIVA', prisma: 'TRIPAY_VA_BNI' },
            'BRIVA': { tripay: 'BRIVA', prisma: 'TRIPAY_VA_BRI' },
            'MANDIRIVA': { tripay: 'MANDIRIVA', prisma: 'TRIPAY_VA_MANDIRI' },
            'PERMATAVA': { tripay: 'PERMATAVA', prisma: 'TRIPAY_VA_PERMATA' },
            'OVO': { tripay: 'OVO', prisma: 'TRIPAY_OVO' },
            'DANA': { tripay: 'DANA', prisma: 'TRIPAY_DANA' },
            'SHOPEEPAY': { tripay: 'SHOPEEPAY', prisma: 'TRIPAY_SHOPEEPAY' },
        };

        const mapped = methodMapping[method] || methodMapping['QRIS'];

        const deposit = await this.prisma.deposit.create({
            data: {
                userId: ownerId,
                merchantId,
                amount,
                method: mapped.prisma,
                status: 'PENDING'
            }
        });

        const tripayPayload = {
            method: mapped.tripay,
            merchant_ref: `DEP-${deposit.id}`,
            amount: amount,
            customer_name: 'Merchant DagangPlay',
            customer_email: 'merchant@dagangplay.com',
            order_items: [
                {
                    sku: 'TOPUP',
                    name: `Top Up Saldo - Rp ${amount}`,
                    price: amount,
                    quantity: 1
                }
            ],
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/finance`
        };

        try {
            const tripayRes = await this.tripay.requestTransaction(tripayPayload);
            await this.prisma.deposit.update({
                where: { id: deposit.id },
                data: {
                    tripayReference: tripayRes.data.reference,
                    tripayPaymentUrl: tripayRes.data.checkout_url,
                    tripayMerchantRef: `DEP-${deposit.id}`,
                    tripayResponse: tripayRes.data as any,
                    tripayVaNumber: tripayRes.data.pay_code,
                    tripayQrUrl: tripayRes.data.qr_url
                }
            });
            return {
                ...deposit,
                checkoutUrl: tripayRes.data.checkout_url
            };
        } catch (e) {
            console.error('[FinanceService] Tripay Deposit Error:', e);
            throw new BadRequestException('Gagal menghubungi Tripay untuk Topup');
        }
    }
}
