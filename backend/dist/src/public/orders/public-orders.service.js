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
exports.PublicOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const tripay_service_1 = require("../../tripay/tripay.service");
let PublicOrdersService = class PublicOrdersService {
    prisma;
    tripay;
    constructor(prisma, tripay) {
        this.prisma = prisma;
        this.tripay = tripay;
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
    async createCheckout(body) {
        const { skuId, gameId, serverId, whatsapp, paymentMethod } = body;
        const sku = await this.prisma.productSku.findUnique({
            where: { id: skuId },
            include: { product: { include: { category: true } } }
        });
        if (!sku || sku.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Produk tidak tersedia');
        }
        const merchant = await this.prisma.merchant.findFirst();
        const merchantId = merchant?.id || 'sys-merchant';
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const basePrice = Number(sku.basePrice);
        const sellPrice = Number(sku.priceNormal);
        let guestUser = await this.prisma.user.findFirst({
            where: { phone: whatsapp }
        });
        if (!guestUser) {
            guestUser = await this.prisma.user.create({
                data: {
                    name: `Guest ${whatsapp}`,
                    phone: whatsapp,
                    password: 'GUEST_NO_LOGIN',
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
                priceTierUsed: 'NORMAL',
                basePrice: basePrice,
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
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`
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
            checkoutUrl: tripayRes.data.checkout_url
        };
    }
    async getOrderDetails(orderNumber) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                productSku: {
                    include: { product: { include: { category: true } } }
                },
                payment: true
            }
        });
        if (!order)
            throw new common_1.BadRequestException('Pesanan tidak ditemukan');
        return order;
    }
};
exports.PublicOrdersService = PublicOrdersService;
exports.PublicOrdersService = PublicOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tripay_service_1.TripayService])
], PublicOrdersService);
//# sourceMappingURL=public-orders.service.js.map