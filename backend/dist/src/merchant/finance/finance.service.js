"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const tripay_service_1 = require("../../tripay/tripay.service");
const pagination_1 = require("../../common/utils/pagination");
let FinanceService = class FinanceService {
    prisma;
    tripay;
    constructor(prisma, tripay) {
        this.prisma = prisma;
        this.tripay = tripay;
    }
    async getFinanceOverview(merchantId, ownerId) {
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
    async requestWithdrawal(merchantId, ownerId, amount, bankName, bankAccountName, bankAccountNumber, isInstant) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        const fee = isInstant ? 5000 : 0;
        const netAmount = amount - fee;
        if (netAmount <= 0)
            throw new common_1.BadRequestException('Amount tidak mencukupi setelah dikurangi fee');
        return this.prisma.$transaction(async (tx) => {
            const merchant = await tx.merchant.findUnique({
                where: { id: merchantId },
                select: { id: true, availableBalance: true, ownerId: true }
            });
            if (!merchant || merchant.ownerId !== ownerId) {
                throw new common_1.BadRequestException('Anda tidak berwenang melakukan penarikan untuk toko ini');
            }
            if (merchant.availableBalance < amount) {
                throw new common_1.BadRequestException('Saldo tersedia tidak mencukupi untuk penarikan ini');
            }
            const updatedMerchant = await tx.merchant.update({
                where: {
                    id: merchantId,
                    availableBalance: { gte: amount }
                },
                data: { availableBalance: { decrement: amount } }
            });
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
    async requestDeposit(merchantId, ownerId, amount, method) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        const methodMapping = {
            'QRISC': { tripay: 'QRISC', prisma: 'TRIPAY_QRIS' },
            'QRIS': { tripay: 'QRISC', prisma: 'TRIPAY_QRIS' },
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
                    tripayResponse: tripayRes.data,
                    tripayVaNumber: tripayRes.data.pay_code,
                    tripayQrUrl: tripayRes.data.qr_url
                }
            });
            return {
                ...deposit,
                checkoutUrl: tripayRes.data.checkout_url
            };
        }
        catch (e) {
            console.error('[FinanceService] Tripay Deposit Error:', e);
            throw new common_1.BadRequestException('Gagal menghubungi Tripay untuk Topup');
        }
    }
    async getDeposits(ownerId, page = 1, perPage = 10) {
        return (0, pagination_1.paginate)(this.prisma.deposit, {
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' }
        }, { page, perPage });
    }
    async getWithdrawals(ownerId, page = 1, perPage = 10) {
        return (0, pagination_1.paginate)(this.prisma.withdrawal, {
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' }
        }, { page, perPage });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, tripay_service_1.TripayService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map