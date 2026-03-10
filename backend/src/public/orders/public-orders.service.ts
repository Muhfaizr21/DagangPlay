import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';

@Injectable()
export class PublicOrdersService {
    constructor(
        private prisma: PrismaService,
        private tripay: TripayService
    ) { }

    private mapPaymentMethod(code: string): any {
        const mapping: Record<string, string> = {
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

    async createCheckout(body: any) {
        const { skuId, gameId, serverId, whatsapp, paymentMethod } = body;

        // 1. Get the SKU details
        const sku = await this.prisma.productSku.findUnique({
            where: { id: skuId },
            include: { product: { include: { category: true } } }
        });

        if (!sku || sku.status !== 'ACTIVE' || sku.product.status !== 'ACTIVE') {
            const reason = sku?.product.status === 'MAINTENANCE'
                ? 'Produk sedang dalam pemeliharaan (Master Maintenance)'
                : 'Produk tidak tersedia atau sedang dinonaktifkan oleh pusat';
            throw new BadRequestException(reason);
        }

        // 2. Get Merchant info & plan
        const merchant = await this.prisma.merchant.findFirst(); // Using default merchant for now
        const merchantId = merchant?.id || 'sys-merchant';
        const merchantPlan = merchant?.plan || 'FREE';

        // 2.1 CHECK MERCHANT CUSTOM PRICING & VISIBILITY
        const merchantOverride = await this.prisma.merchantProductPrice.findUnique({
            where: {
                merchantId_productSkuId: {
                    merchantId,
                    productSkuId: sku.id
                }
            }
        });

        // Visibility Boundary check: If merchant manually deactivated this 
        if (merchantOverride && !merchantOverride.isActive) {
            throw new BadRequestException('Produk ini sedang dinonaktifkan oleh pemilik toko');
        }

        const basePrice = Number(sku.basePrice);

        // Price Leakage fix: Use merchant's custom price if available, otherwise fallback to platform default (priceNormal)
        const sellPrice = merchantOverride ? Number(merchantOverride.customPrice) : Number(sku.priceNormal);

        // 2.2 Calculate Modal Price for Merchant (What they owe DagangPlay / Super Admin)
        let modalPrice = Number(sku.priceNormal);
        let tier: any = 'NORMAL';

        if (merchantPlan === 'PRO') {
            modalPrice = Number(sku.pricePro);
            tier = 'PRO';
        } else if (merchantPlan === 'LEGEND') {
            modalPrice = Number(sku.priceLegend);
            tier = 'LEGEND';
        } else if (merchantPlan === 'SUPREME') {
            modalPrice = Number(sku.priceSupreme);
            tier = 'SUPREME';
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 2.5 Ensure Guest User Exists
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

        // 3. Create Order in DB (Pending Tripay Transaction)
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

        // 4. Request Tripay Payment
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

        // 5. Update Order with Tripay details
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
                tripayResponse: tripayRes.data as any, // Storing everything!
            }
        });

        return {
            success: true,
            orderNumber: order.orderNumber,
            checkoutUrl: tripayRes.data.checkout_url
        };
    }

    async getOrderDetails(orderNumber: string) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                productSku: {
                    include: { product: { include: { category: true } } }
                },
                payment: true
            }
        });

        if (!order) throw new BadRequestException('Pesanan tidak ditemukan');

        return order;
    }
}
