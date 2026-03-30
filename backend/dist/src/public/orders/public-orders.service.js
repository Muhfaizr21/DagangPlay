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
var PublicOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOrdersService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const tripay_service_1 = require("../../tripay/tripay.service");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
const whatsapp_service_1 = require("../../common/notifications/whatsapp.service");
let PublicOrdersService = PublicOrdersService_1 = class PublicOrdersService {
    prisma;
    tripay;
    digiflazz;
    subscriptionsService;
    whatsappService;
    logger = new common_1.Logger(PublicOrdersService_1.name);
    constructor(prisma, tripay, digiflazz, subscriptionsService, whatsappService) {
        this.prisma = prisma;
        this.tripay = tripay;
        this.digiflazz = digiflazz;
        this.subscriptionsService = subscriptionsService;
        this.whatsappService = whatsappService;
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
        const { skuId, gameId, serverId, whatsapp, paymentMethod, promoCode } = body;
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
        try {
            const supplierBalance = await this.digiflazz.checkBalance();
            if (supplierBalance < Number(sku.basePrice)) {
                throw new common_1.BadRequestException('Produk sedang dalam pemeliharaan (Stok sedang kosong di pusat)');
            }
        }
        catch (err) {
            console.warn('[Checkout] Failed to check supplier balance, skipping check to allow potential order.');
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
        let sellPrice = merchantOverride ? Number(merchantOverride.customPrice) : Number(sku.priceNormal);
        sellPrice = Math.ceil(sellPrice);
        let promoCodeId = undefined;
        let discountAmount = 0;
        if (promoCode) {
            const now = new Date();
            const promo = await this.prisma.promoCode.findFirst({
                where: {
                    code: promoCode.toUpperCase(),
                    isActive: true,
                    OR: [
                        { merchantId: merchant.id },
                        { merchantId: null }
                    ]
                }
            });
            if (!promo) {
                throw new common_1.BadRequestException('Kode promo tidak valid atau tidak dapat digunakan di toko ini');
            }
            if (promo.startDate && now < promo.startDate)
                throw new common_1.BadRequestException('Kode promo belum dapat digunakan');
            if (promo.endDate && now > promo.endDate)
                throw new common_1.BadRequestException('Kode promo telah kadaluarsa');
            if (promo.quota !== null && promo.usedCount >= promo.quota) {
                throw new common_1.BadRequestException('Kuota penggunaan kode promo telah habis');
            }
            if (promo.minPurchase && sellPrice < promo.minPurchase) {
                throw new common_1.BadRequestException(`Minimal pembelian untuk promo ini adalah Rp ${promo.minPurchase.toLocaleString('id-ID')}`);
            }
            if (promo.type === 'DISCOUNT_FLAT') {
                discountAmount = promo.value;
            }
            else if (promo.type === 'DISCOUNT_PERCENTAGE') {
                discountAmount = (sellPrice * promo.value) / 100;
                if (promo.maxDiscount) {
                    discountAmount = Math.min(discountAmount, promo.maxDiscount);
                }
            }
            discountAmount = Math.ceil(Math.min(discountAmount, sellPrice));
            sellPrice -= discountAmount;
            promoCodeId = promo.id;
        }
        sellPrice = Math.max(0, Math.ceil(sellPrice));
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
        if (!paymentMethod)
            throw new common_1.BadRequestException('Metode pembayaran harus dipilih');
        if (!whatsapp)
            throw new common_1.BadRequestException('Nomor WhatsApp diperlukan');
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
                    isGuest: true,
                    referralCode: `GUEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                }
            });
        }
        let resolvedNickname = 'Checking...';
        try {
            const cache = await this.prisma.gameNickname.findUnique({
                where: {
                    productId_gameUserId_serverId: {
                        productId: sku.product.id,
                        gameUserId: gameId,
                        serverId: serverId || ''
                    }
                }
            });
            if (cache && cache.expiresAt > new Date()) {
                resolvedNickname = cache.nickname;
            }
        }
        catch (e) {
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
                gameUserName: resolvedNickname,
                gameUserId: gameId,
                gameUserServerId: serverId,
                whatsapp,
                promoCodeId,
                discountAmount
            }
        });
        if (promoCodeId) {
            await this.prisma.promoCode.update({
                where: { id: promoCodeId },
                data: { usedCount: { increment: 1 } }
            });
            await this.prisma.promoUsage.create({
                data: {
                    promoCodeId,
                    userId: guestUser.id,
                    orderId: order.id,
                    discountAmount
                }
            });
        }
        const tripayPayload = {
            method: paymentMethod,
            merchant_ref: order.orderNumber,
            amount: Math.ceil(sellPrice),
            customer_name: gameId || 'User',
            customer_email: 'customer@dagangplay.com',
            customer_phone: whatsapp,
            order_items: [
                {
                    sku: sku.supplierCode,
                    name: `${sku.product.category.name} - ${sku.product.name} - ${sku.name}`,
                    price: Math.ceil(sellPrice),
                    quantity: 1
                }
            ],
            return_url: `${origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`
        };
        this.logger.log(`Initiating Tripay Request: ${order.orderNumber} via ${paymentMethod}`);
        const tripayRes = await this.tripay.requestTransaction(tripayPayload, merchantId);
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
        this.whatsappService.sendOrderNotification(whatsapp, order.orderNumber, `${sku.product.name} - ${sku.name}`, sellPrice, tripayRes.data.checkout_url).catch(err => this.logger.error(`Failed to send WA: ${err.message}`));
        this.whatsappService.sendAdminSummary(`🛒 *PESANAN BARU*\n` +
            `Order: ${order.orderNumber}\n` +
            `Produk: ${sku.product.name} - ${sku.name}\n` +
            `Harga: Rp ${sellPrice.toLocaleString('id-ID')}\n` +
            `Buyer: ${whatsapp}`).catch(() => { });
        return {
            success: true,
            orderNumber: order.orderNumber,
            payment: tripayRes.data
        };
    }
    async reverseCommission(orderId, tx) {
        const db = tx || this.prisma;
        const commissions = await db.commission.findMany({
            where: { orderId, status: { in: ['PENDING', 'SETTLED'] } }
        });
        if (commissions.length === 0)
            return;
        const work = async (innerTx) => {
            for (const comm of commissions) {
                const merchant = await innerTx.merchant.findFirst({
                    where: { ownerId: comm.userId }
                });
                if (merchant) {
                    if (comm.status === 'PENDING') {
                        const updated = await innerTx.merchant.update({
                            where: { id: merchant.id },
                            data: { escrowBalance: { decrement: comm.amount } }
                        });
                        await innerTx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchant.id,
                                orderId,
                                type: 'ESCROW_OUT',
                                amount: -comm.amount,
                                description: `Reversal komisi pending (Refund Admin): ${orderId}`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: merchant.availableBalance,
                                escrowBefore: merchant.escrowBalance,
                                escrowAfter: updated.escrowBalance
                            }
                        });
                    }
                    else if (comm.status === 'SETTLED') {
                        const updated = await innerTx.merchant.update({
                            where: { id: merchant.id },
                            data: { availableBalance: { decrement: comm.amount } }
                        });
                        await innerTx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchant.id,
                                orderId,
                                type: 'AVAILABLE_OUT',
                                amount: -comm.amount,
                                description: `Clawback profit yang sudah cair (Refund Admin): ${orderId}`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: updated.availableBalance,
                                escrowBefore: updated.escrowBalance,
                                escrowAfter: updated.escrowBalance
                            }
                        });
                    }
                }
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
        const hostWithoutPort = host?.split(':')[0] || '';
        const isMainDomain = !host ||
            hostWithoutPort.includes('localhost') ||
            hostWithoutPort.includes('127.0.0.1') ||
            hostWithoutPort.includes('dagangplay.com') ||
            hostWithoutPort.includes('trycloudflare.com');
        const merchant = isMainDomain && !merchantSlug ? null : await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    merchantSlug ? { slug: merchantSlug } : {},
                    { domain: hostWithoutPort },
                    !isMainDomain ? { slug: hostWithoutPort.split('.')[0] } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });
        const targetMerchant = merchant || await this.prisma.merchant.findFirst({
            where: { isOfficial: true, status: 'ACTIVE' }
        });
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
    async resolveCustomDomain(domain) {
        const domainWithoutPort = domain.split(':')[0];
        const merchant = await this.prisma.merchant.findFirst({
            where: { domain: domainWithoutPort }
        });
        if (!merchant)
            return { slug: null };
        return { slug: merchant.slug };
    }
    async getPaymentChannels() {
        return this.tripay.getPaymentChannels();
    }
    async getActiveMerchants() {
        return this.prisma.merchant.findMany({
            where: { status: 'ACTIVE', isOfficial: false },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                bannerImage: true,
                tagline: true,
                domain: true
            },
            take: 12,
            orderBy: { createdAt: 'desc' }
        });
    }
    async validateNickname(productId, gameId, serverId) {
        try {
            const cache = await this.prisma.gameNickname.findUnique({
                where: {
                    productId_gameUserId_serverId: {
                        productId,
                        gameUserId: gameId,
                        serverId: serverId || ''
                    }
                }
            });
            if (cache && cache.expiresAt > new Date()) {
                return { success: true, nickname: cache.nickname, fromCache: true };
            }
        }
        catch (e) {
            this.logger.error(`[GameValidation] Cache read error: ${e}`);
        }
        try {
            const isMockExternalSuccess = true;
            if (!isMockExternalSuccess) {
                throw new Error("Layanan Eksternal Sedang Gangguan");
            }
            const externalNickname = `Pemain ${gameId}`;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 3);
            await this.prisma.gameNickname.upsert({
                where: {
                    productId_gameUserId_serverId: {
                        productId,
                        gameUserId: gameId,
                        serverId: serverId || ''
                    }
                },
                update: { nickname: externalNickname, expiresAt, cachedAt: new Date() },
                create: { productId, gameUserId: gameId, serverId: serverId || '', nickname: externalNickname, expiresAt }
            });
            await this.prisma.gameValidation.create({
                data: {
                    productId,
                    gameUserId: gameId,
                    serverId: serverId || '',
                    nickname: externalNickname,
                    isValid: true
                }
            });
            return { success: true, nickname: externalNickname, fromCache: false };
        }
        catch (err) {
            this.logger.warn(`[GameValidation] API Timeout / Gangguan. Returning fallback.`);
            await this.prisma.gameValidation.create({
                data: {
                    productId,
                    gameUserId: gameId,
                    serverId: serverId || '',
                    nickname: 'N/A',
                    isValid: false
                }
            });
            return {
                success: false,
                nickname: 'Checking...',
                message: 'Pengecekan akun game sedang gangguan, tapi Anda tetap dapat melanjutkan pesanan.'
            };
        }
    }
};
exports.PublicOrdersService = PublicOrdersService;
exports.PublicOrdersService = PublicOrdersService = PublicOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tripay_service_1.TripayService,
        digiflazz_service_1.DigiflazzService,
        subscriptions_service_1.SubscriptionsService,
        whatsapp_service_1.WhatsappService])
], PublicOrdersService);
//# sourceMappingURL=public-orders.service.js.map