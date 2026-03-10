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

    async requestDeposit(merchantId: string, ownerId: string, amount: number, method: PaymentMethod) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');

        let mappedMethod: PaymentMethod = 'TRIPAY_QRIS';
        let tripayMethod = 'QRISC';

        // Handle incoming method string from frontend which might not match prisma exactly
        const methodStr = method as string;
        if (methodStr === 'BANK_TRANSFER' || methodStr === 'TRIPAY_VA_BCA') {
            mappedMethod = 'TRIPAY_VA_BCA';
            tripayMethod = 'BCAVA';
        } else if (methodStr === 'EWALLET' || methodStr === 'TRIPAY_OVO') {
            mappedMethod = 'TRIPAY_OVO';
            tripayMethod = 'OVO';
        } else if (methodStr === 'QRIS' || methodStr === 'TRIPAY_QRIS') {
            mappedMethod = 'TRIPAY_QRIS';
            tripayMethod = 'QRISC';
        }

        const deposit = await this.prisma.deposit.create({
            data: {
                userId: ownerId,
                merchantId,
                amount,
                method: mappedMethod,
                status: 'PENDING'
            }
        });

        const tripayPayload = {
            method: tripayMethod,
            merchant_ref: deposit.id,
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
            return_url: `http://localhost:3000/admin/dashboard`
        };

        try {
            const tripayRes = await this.tripay.requestTransaction(tripayPayload);
            await this.prisma.deposit.update({
                where: { id: deposit.id },
                data: {
                    tripayReference: tripayRes.data.reference,
                    tripayPaymentUrl: tripayRes.data.checkout_url
                }
            });
            return {
                ...deposit,
                checkoutUrl: tripayRes.data.checkout_url
            };
        } catch (e) {
            console.error(e);
            throw new BadRequestException('Gagal menghubungi Tripay untuk Topup');
        }
    }
}
