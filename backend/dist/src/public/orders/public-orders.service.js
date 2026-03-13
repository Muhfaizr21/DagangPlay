"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOrdersService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const tripay_service_1 = require("../../tripay/tripay.service");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let PublicOrdersService = class PublicOrdersService {
    prisma;
    tripay;
    digiflazz;
    subscriptionsService;
    constructor(prisma, tripay, digiflazz, subscriptionsService) {
        this.prisma = prisma;
        this.tripay = tripay;
        this.digiflazz = digiflazz;
        this.subscriptionsService = subscriptionsService;
    }
    mapPaymentMethod(code) {
        const mapping = {
            'QRISC': 'TRIPAY_QRIS',
            'BCAVA': 'TRIPAY_VA_BCA',
            'BNIVA': 'TRIPAY_VA_BNI',
            'BRIVA': 'TRIPAY_VA_BRI',
            'MANDIRIVA': 'TRIPAY_VA_MANDIRI',
            'PERMATAVA': 'TRIPAY_VA_PERMATA',
            'GOPAY': 'TRIPAY_GOPAY',
            'OVO': 'TRIPAY_OVO',
            'DANA': 'TRIPAY_DANA',
            'SHOPEEPAY': 'TRIPAY_SHOPEEPAY',
            'ALFAMART': 'TRIPAY_ALFAMART',
            'INDOMARET': 'TRIPAY_INDOMARET',
        };
        return mapping[code] || 'TRIPAY_QRIS';
    }
    async createCheckout(body, host, origin, merchantSlug) {
        const { skuId, gameId, serverId, whatsapp, paymentMethod } = body;
        const sku = await this.prisma.productSku.findUnique({
            where: { id: skuId },
            include: { product: { include: { category: true } } }
        });
        if (!sku || sku.status !== 'ACTIVE' || sku.product.status !== 'ACTIVE') {
            const reason = sku?.product.status === 'MAINTENANCE'
                ? 'Produk sedang dalam pemeliharaan (Master Maintenance)'
                : 'Produk tidak tersedia atau sedang dinonaktifkan oleh pusat';
            throw new common_1.BadRequestException(reason);
        }
        const availability = await this.digiflazz.checkAvailability(sku.supplierCode);
        if (!availability.isAvailable) {
            throw new common_1.BadRequestException(availability.reason);
        }
        const targetMerchant = await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    merchantSlug ? { slug: merchantSlug } : {},
                    { domain: host },
                    { slug: host?.split('.')[0] }
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });
        let merchant = targetMerchant;
        if (!merchant) {
            merchant = await this.prisma.merchant.findFirst({ where: { isOfficial: true, status: 'ACTIVE' } });
        }
        if (!merchant) {
            throw new common_1.BadRequestException('Toko tidak ditemukan atau sedang tidak aktif');
        }
        if (merchant.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Toko ini sedang ditangguhkan atau dinonaktifkan oleh administrator.');
        }
        if (merchant.planExpiredAt) {
            const now = new Date();
            if (now > merchant.planExpiredAt) {
                throw new common_1.BadRequestException('Masa aktif toko ini telah berakhir. Silakan hubungi pemilik toko untuk perpanjangan.');
            }
        }
        const merchantId = merchant.id;
        const merchantPlan = merchant.plan;
        const merchantOverride = await this.prisma.merchantProductPrice.findUnique({
            where: {
                merchantId_productSkuId: {
                    merchantId,
                    productSkuId: sku.id
                }
            }
        });
        const isProductActiveForMerchant = merchantOverride ? merchantOverride.isActive : merchant.isOfficial;
        if (!isProductActiveForMerchant) {
            throw new common_1.BadRequestException('Produk ini tidak tersedia di toko ini atau telah dinonaktifkan oleh pemilik toko');
        }
        const basePrice = Number(sku.basePrice);
        const sellPrice = merchantOverride ? Number(merchantOverride.customPrice) : Number(sku.priceNormal);
        let modalPrice = Number(sku.pricePro);
        let tier = 'PRO';
        if (merchantOverride && merchantOverride.customModalPrice) {
            modalPrice = Number(merchantOverride.customModalPrice);
            tier = 'SPECIAL_OVERRIDE';
        }
        else {
            if (merchantPlan === 'PRO') {
                modalPrice = Number(sku.pricePro);
                tier = 'PRO';
            }
            else if (merchantPlan === 'LEGEND') {
                modalPrice = Number(sku.priceLegend);
                tier = 'LEGEND';
            }
            else if (merchantPlan === 'SUPREME') {
                modalPrice = Number(sku.priceSupreme);
                tier = 'SUPREME';
            }
            else {
                modalPrice = Number(sku.pricePro);
                tier = 'PRO';
            }
        }
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let guestUser = await this.prisma.user.findFirst({
            where: { phone: whatsapp }
        });
        if (!guestUser) {
            const hashedPassword = await bcrypt.hash('GUEST_NO_LOGIN', 10);
            guestUser = await this.prisma.user.create({
                data: {
                    name: `Guest ${whatsapp}`,
                    phone: whatsapp,
                    merchantId: merchantId,
                    password: hashedPassword,
                    referralCode: `GUEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                }
            });
        }
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                userId: guestUser.id,
                merchantId,
                productId: sku.product.id,
                productSkuId: sku.id,
                productName: sku.product.name,
                productSkuName: sku.name,
                priceTierUsed: tier,
                basePrice: basePrice,
                merchantModalPrice: modalPrice,
                sellingPrice: sellPrice,
                totalPrice: sellPrice,
                paymentStatus: 'PENDING',
                fulfillmentStatus: 'PENDING',
                paymentMethod: this.mapPaymentMethod(paymentMethod),
                gameUserName: 'Checking...',
                gameUserId: gameId,
                gameUserServerId: serverId,
            }
        });
        const tripayPayload = {
            method: paymentMethod,
            merchant_ref: order.orderNumber,
            amount: sellPrice,
            customer_name: gameId,
            customer_email: 'customer@dagangplay.com',
            customer_phone: whatsapp,
            order_items: [
                {
                    sku: sku.supplierCode,
                    name: `${sku.product.category.name} - ${sku.product.name} - ${sku.name}`,
                    price: sellPrice,
                    quantity: 1
                }
            ],
            return_url: `${origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`
        };
        const tripayRes = await this.tripay.requestTransaction(tripayPayload);
        await this.prisma.payment.create({
            data: {
                orderId: order.id,
                userId: guestUser.id,
                merchantId: merchantId,
                method: this.mapPaymentMethod(paymentMethod),
                amount: sellPrice,
                totalAmount: sellPrice,
                status: 'PENDING',
                tripayReference: tripayRes.data.reference,
                tripayMerchantRef: order.orderNumber,
                tripayPaymentUrl: tripayRes.data.checkout_url,
                tripayResponse: tripayRes.data,
            }
        });
        return {
            success: true,
            orderNumber: order.orderNumber,
            payment: tripayRes.data
        };
    }
    async reverseCommission(orderId, tx) {
        const db = tx || this.prisma;
        const commissions = await db.commission.findMany({
            where: { orderId, status: 'SETTLED' }
        });
        if (commissions.length === 0)
            return;
        const work = async (innerTx) => {
            for (const comm of commissions) {
                const user = await innerTx.user.update({
                    where: { id: comm.userId },
                    data: { balance: { decrement: comm.amount } }
                });
                await innerTx.balanceTransaction.create({
                    data: {
                        userId: comm.userId,
                        type: 'REFUND',
                        amount: -comm.amount,
                        balanceBefore: Number(user.balance) + comm.amount,
                        balanceAfter: Number(user.balance),
                        orderId,
                        description: `Reversal profit (Order Gagal/Cancel): ${orderId}`
                    }
                });
                await innerTx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'CANCELLED' }
                });
            }
        };
        if (tx) {
            await work(tx);
        }
        else {
            await this.prisma.$transaction(async (newTx) => {
                await work(newTx);
            });
        }
    }
    async getOrderDetails(orderNumber) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                payment: true
            }
        });
        if (!order)
            throw new common_1.BadRequestException('Pesanan tidak ditemukan');
        return order;
    }
    async findOrdersByWhatsApp(phone) {
        const user = await this.prisma.user.findFirst({
            where: { phone }
        });
        if (!user)
            throw new common_1.BadRequestException('Nomor WhatsApp ini belum memiliki riwayat pesanan');
        return this.prisma.order.findMany({
            where: { userId: user.id },
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }
    async getStoreConfig(host, merchantSlug) {
        const isMainDomain = !host ||
            host.includes('localhost') ||
            host.includes('dagangplay.com') ||
            host.includes('trycloudflare.com');
        const merchant = isMainDomain && !merchantSlug ? null : await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    merchantSlug ? { slug: merchantSlug } : {},
                    { domain: host },
                    !isMainDomain ? { slug: host?.split('.')[0] } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });
        const targetMerchant = merchant || await this.prisma.merchant.findFirst({ where: { isOfficial: true, status: 'ACTIVE' } });
        if (!targetMerchant) {
            return {
                name: 'DagangPlay',
                logo: null,
                whiteLabel: false,
                plan: 'FREE',
                isOfficial: true
            };
        }
        const features = await this.subscriptionsService.getMerchantPlanFeatures(targetMerchant.id);
        if (!targetMerchant.isOfficial) {
            if (targetMerchant.status === 'SUSPENDED' || targetMerchant.status === 'INACTIVE') {
                return {
                    isSuspended: true,
                    statusCode: 403,
                    name: targetMerchant.name,
                    message: "Toko sedang dalam perbaikan / ditangguhkan"
                };
            }
            if (features.isExpired) {
                return {
                    isExpired: true,
                    statusCode: 403,
                    name: targetMerchant.name,
                    message: "Masa aktif toko ini telah berakhir"
                };
            }
        }
        console.log(`[PublicOrdersService] getStoreConfig: host=${host}, selectedMerchant=${targetMerchant.name}, theme=${JSON.stringify(targetMerchant.settings?.theme)}`);
        return {
            id: targetMerchant.id,
            name: targetMerchant.name,
            logo: targetMerchant.logo,
            banner: targetMerchant.bannerImage,
            tagline: targetMerchant.tagline,
            whiteLabel: features.whiteLabel || false,
            plan: targetMerchant.plan,
            slug: targetMerchant.slug,
            isOfficial: targetMerchant.isOfficial,
            theme: targetMerchant.settings?.theme || { active: 'dark' }
        };
    }
};
exports.PublicOrdersService = PublicOrdersService;
exports.PublicOrdersService = PublicOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tripay_service_1.TripayService,
        digiflazz_service_1.DigiflazzService,
        subscriptions_service_1.SubscriptionsService])
], PublicOrdersService);
//# sourceMappingURL=public-orders.service.js.map