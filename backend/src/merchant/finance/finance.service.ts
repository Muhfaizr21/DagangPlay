import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaymentMethod } from '@prisma/client';
import { TripayService } from '../../tripay/tripay.service';
import { paginate } from '../../common/utils/pagination';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService, private tripay: TripayService) { }

    async getFinanceOverview(merchantId: string, ownerId: string) {
        const orders = await this.prisma.order.findMany({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', paymentStatus: 'PAID' },
            select: { totalPrice: true, merchantModalPrice: true }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
        const totalProfit = orders.reduce((sum, order) => sum + (Number(order.totalPrice) - Number(order.merchantModalPrice || order.totalPrice)), 0);

        const deposits = await this.prisma.deposit.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const withdrawals = await this.prisma.withdrawal.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { availableBalance: true, escrowBalance: true }
        });

        return {
            balance: merchant?.availableBalance || 0,
            escrow: merchant?.escrowBalance || 0,
            revenue: totalRevenue,
            profit: totalProfit,
            deposits,
            withdrawals
        };
    }

    async requestWithdrawal(merchantId: string, ownerId: string, amount: number, bankName: string, bankAccountName: string, bankAccountNumber: string, isInstant?: boolean) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        const fee = isInstant ? 5000 : 0;
        const netAmount = amount - fee;

        if (netAmount <= 0) throw new BadRequestException('Amount tidak mencukupi setelah dikurangi fee');

        // FIXED: Use Merchant Ledger (availableBalance) instead of User.balance
        return this.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.findUnique({ 
                where: { id: merchantId },
                select: { id: true, availableBalance: true, ownerId: true }
            });

            if (!merchant || merchant.ownerId !== ownerId) {
                throw new BadRequestException('Anda tidak berwenang melakukan penarikan untuk toko ini');
            }

            if (merchant.availableBalance < amount) {
                throw new BadRequestException('Saldo tersedia tidak mencukupi untuk penarikan ini');
            }

            // Deduct from Merchant Ledger immediately
            const updatedMerchant = await tx.merchant.update({
                where: { id: merchantId },
                data: { availableBalance: { decrement: amount } }
            });

            // Log the movement in Merchant Ledger
            await tx.merchantLedgerMovement.create({
                data: {
                    merchantId,
                    type: 'AVAILABLE_OUT',
                    amount: -amount,
                    description: `Penarikan saldo ${isInstant ? 'instant' : 'manual'} ke ${bankName} - ${bankAccountNumber}`,
                    availableBefore: merchant.availableBalance,
                    availableAfter: updatedMerchant.availableBalance,
                    escrowBefore: updatedMerchant.escrowBalance,
                    escrowAfter: updatedMerchant.escrowBalance
                }
            });

            // Keep user balance transaction for history/compatibility
            await tx.balanceTransaction.create({
                data: {
                    userId: ownerId,
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    description: `Withdrawal dari toko ${merchantId}`
                }
            });

            return tx.withdrawal.create({
                data: {
                    userId: ownerId,
                    amount,
                    fee,
                    netAmount,
                    bankName,
                    bankAccountName,
                    bankAccountNumber,
                    status: isInstant ? 'PROCESSING' : 'PENDING',
                    note: isInstant ? 'Diterima sebagai penarikan INSTAN (Sedang diproses sistem payout/admin)' : undefined
                }
            });
        });
    }

    async requestDeposit(merchantId: string, ownerId: string, amount: number, method: string) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        // Map frontend method code to Tripay code & Prisma enum
        // Frontend now sends valid Tripay codes directly (QRISC, BCAVA, etc.)
        const methodMapping: Record<string, { tripay: string, prisma: PaymentMethod }> = {
            'QRISC': { tripay: 'QRISC', prisma: 'TRIPAY_QRIS' },
            'QRIS': { tripay: 'QRISC', prisma: 'TRIPAY_QRIS' }, // legacy
            'BCAVA': { tripay: 'BCAVA', prisma: 'TRIPAY_VA_BCA' },
            'BNIVA': { tripay: 'BNIVA', prisma: 'TRIPAY_VA_BNI' },
            'BRIVA': { tripay: 'BRIVA', prisma: 'TRIPAY_VA_BRI' },
            'MANDIRIVA': { tripay: 'MANDIRIVA', prisma: 'TRIPAY_VA_MANDIRI' },
            'PERMATAVA': { tripay: 'PERMATAVA', prisma: 'TRIPAY_VA_PERMATA' },
            'OVO': { tripay: 'OVO', prisma: 'TRIPAY_OVO' },
            'DANA': { tripay: 'DANA', prisma: 'TRIPAY_DANA' },
            'SHOPEEPAY': { tripay: 'SHOPEEPAY', prisma: 'TRIPAY_SHOPEEPAY' },
            'GOPAY': { tripay: 'GOPAY', prisma: 'TRIPAY_GOPAY' },
            'ALFAMART': { tripay: 'ALFAMART', prisma: 'TRIPAY_ALFAMART' },
            'INDOMARET': { tripay: 'INDOMARET', prisma: 'TRIPAY_INDOMARET' },
        };

        const mapped = methodMapping[method] || methodMapping['QRISC'];

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
            const tripayRes = await this.tripay.requestTransaction(tripayPayload, merchantId);
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
    async getDeposits(ownerId: string, page: number = 1, perPage: number = 10) {
        return paginate(this.prisma.deposit, {
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' }
        }, { page, perPage });
    }

    async getWithdrawals(ownerId: string, page: number = 1, perPage: number = 10) {
        return paginate(this.prisma.withdrawal, {
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' }
        }, { page, perPage });
    }
}
