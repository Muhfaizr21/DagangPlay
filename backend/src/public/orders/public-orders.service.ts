import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublicOrdersService {
    constructor(
        private prisma: PrismaService,
        private tripay: TripayService,
        private digiflazz: DigiflazzService,
        private subscriptionsService: SubscriptionsService
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

    async createCheckout(body: any, host?: string, origin?: string, merchantSlug?: string) {
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

        // 1.1 REAL-TIME STOCK CHECK (Supplier Side)
        const availability = await this.digiflazz.checkAvailability(sku.supplierCode);
        if (!availability.isAvailable) {
            throw new BadRequestException(availability.reason);
        }

        // 2. TENANT IDENTIFICATION (Isolation Fix)
        // Identify merchant by domain/slug
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
            // Fallback to official if no host-specific merchant found
            merchant = await this.prisma.merchant.findFirst({ where: { isOfficial: true, status: 'ACTIVE' } });
        }

        if (!merchant) {
            throw new BadRequestException('Toko tidak ditemukan atau sedang tidak aktif');
        }

        // 2.1 Explicit Block for Suspended/Inactive Merchants
        if (merchant.status !== 'ACTIVE') {
            throw new BadRequestException('Toko ini sedang ditangguhkan atau dinonaktifkan oleh administrator.');
        }

        // 2.3 Subscription Enforcement (SaaS Protection)
        if (merchant.planExpiredAt) {
            const now = new Date();
            if (now > merchant.planExpiredAt) {
                throw new BadRequestException('Masa aktif toko ini telah berakhir. Silakan hubungi pemilik toko untuk perpanjangan.');
            }
        }

        const merchantId = merchant.id;
        const merchantPlan = merchant.plan;

        // 2.1 CHECK MERCHANT CUSTOM PRICING & VISIBILITY
        const merchantOverride = await this.prisma.merchantProductPrice.findUnique({
            where: {
                merchantId_productSkuId: {
                    merchantId,
                    productSkuId: sku.id
                }
            }
        });

        // Visibility Boundary check (Enforce SaaS opt-in)
        const isProductActiveForMerchant = merchantOverride ? merchantOverride.isActive : merchant.isOfficial;
        if (!isProductActiveForMerchant) {
            throw new BadRequestException('Produk ini tidak tersedia di toko ini atau telah dinonaktifkan oleh pemilik toko');
        }

        const basePrice = Number(sku.basePrice);

        // Retail Price (Selling Price to Customer)
        const sellPrice = merchantOverride ? Number(merchantOverride.customPrice) : Number(sku.priceNormal);

        // 2.2 MODAL PRICE RESOLUTION (Ambiguity Fix)
        // Use customModalPrice set by Admin if exists, otherwise use tiered plan pricing
        // Default to PRO pricing if not specified, since FREE is discontinued
        let modalPrice = Number(sku.pricePro); 
        let tier: any = 'PRO';

        if (merchantOverride && merchantOverride.customModalPrice) {
            // ADMIN OVERRIDE (Wholesale Discount)
            modalPrice = Number(merchantOverride.customModalPrice);
            tier = 'SPECIAL_OVERRIDE';
        } else {
            // STANDARD PLAN TIERING
            if (merchantPlan === 'PRO') {
                modalPrice = Number(sku.pricePro);
                tier = 'PRO';
            } else if (merchantPlan === 'LEGEND') {
                modalPrice = Number(sku.priceLegend);
                tier = 'LEGEND';
            } else if (merchantPlan === 'SUPREME') {
                modalPrice = Number(sku.priceSupreme);
                tier = 'SUPREME';
            } else {
                // Default fallback for any legacy or undefined plans to PRO (Safest minimum profit)
                modalPrice = Number(sku.pricePro);
                tier = 'PRO';
            }
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 2.5 Ensure Guest User Exists
        let guestUser = await this.prisma.user.findFirst({
            where: { phone: whatsapp }
        });

        if (!guestUser) {
            const hashedPassword = await bcrypt.hash('GUEST_NO_LOGIN', 10);

            guestUser = await this.prisma.user.create({
                data: {
                    name: `Guest ${whatsapp}`,
                    phone: whatsapp,
                    merchantId: merchantId, // Tag the user to the store where they first bought
                    password: hashedPassword,
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
            return_url: `${origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`
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
            payment: tripayRes.data
        };
    }

    /**
     * Reversal Profit Merchant jika order Gagal/Batal tapi sudah terbayar
     */
    async reverseCommission(orderId: string, tx?: Prisma.TransactionClient) {
        // Find all settled commissions for this order
        const db = tx || this.prisma;

        const commissions = await db.commission.findMany({
            where: { orderId, status: 'SETTLED' }
        });

        if (commissions.length === 0) return;

        const work = async (innerTx: Prisma.TransactionClient) => {
            for (const comm of commissions) {
                // 1. Deduct balance from the merchant/user who received the profit
                const user = await innerTx.user.update({
                    where: { id: comm.userId },
                    data: { balance: { decrement: comm.amount } }
                });

                // 2. Create Reversal Transaction
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

                // 3. Mark commission as Refunded
                await innerTx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'CANCELLED' }
                });
            }
        };

        if (tx) {
            await work(tx);
        } else {
            await this.prisma.$transaction(async (newTx) => {
                await work(newTx);
            });
        }
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

    async getStoreConfig(host?: string, merchantSlug?: string) {
        // 1. Find Merchant
        const merchant = await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    merchantSlug ? { slug: merchantSlug } : {},
                    { domain: host },
                    { slug: host?.split('.')[0] }
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

        // 2. Get Features
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

        console.log(`[PublicOrdersService] getStoreConfig: host=${host}, selectedMerchant=${targetMerchant.name}, theme=${JSON.stringify((targetMerchant.settings as any)?.theme)}`);

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
            theme: (targetMerchant.settings as any)?.theme || { active: 'dark' }
        };
    }
}
