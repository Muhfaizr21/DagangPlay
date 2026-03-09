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

        if (!sku || sku.status !== 'ACTIVE') {
            throw new BadRequestException('Produk tidak tersedia');
        }

        // 2. Generate Order Number
        const merchant = await this.prisma.merchant.findFirst(); // Using default merchant for now
        const merchantId = merchant?.id || 'sys-merchant';
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const basePrice = Number(sku.basePrice);
        const sellPrice = Number(sku.priceNormal);

        // 3. Create Order in DB (Pending Tripay Transaction)
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                userId: 'guest', // Can be handled better later
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
            return_url: `http://localhost:3000/invoice/${order.orderNumber}`
        };

        const tripayRes = await this.tripay.requestTransaction(tripayPayload);

        // 5. Update Order with Tripay details
        await this.prisma.payment.create({
            data: {
                orderId: order.id,
                userId: 'guest',
                merchantId: merchantId,
                method: this.mapPaymentMethod(paymentMethod),
                amount: sellPrice,
                totalAmount: sellPrice,
                status: 'PENDING',
                tripayReference: tripayRes.data.reference,
            }
        });

        return {
            success: true,
            orderNumber: order.orderNumber,
            checkoutUrl: tripayRes.data.checkout_url
        };
    }
}
