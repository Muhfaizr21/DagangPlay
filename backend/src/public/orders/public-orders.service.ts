import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
import { Prisma } from '@prisma/client';

import { WhatsappService } from '../../common/notifications/whatsapp.service';

@Injectable()
export class PublicOrdersService {
    private readonly logger = new Logger(PublicOrdersService.name);

    constructor(
        private prisma: PrismaService,
        private tripay: TripayService,
        private digiflazz: DigiflazzService,
        private subscriptionsService: SubscriptionsService,
        private whatsappService: WhatsappService
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

        // 1.2 REAL-TIME BALANCE CHECK (Supplier Side)
        try {
            const supplierBalance = await this.digiflazz.checkBalance();
            if (supplierBalance < Number(sku.basePrice)) {
                throw new BadRequestException('Produk sedang dalam pemeliharaan (Stok sedang kosong di pusat)');
            }
        } catch (err) {
            console.warn('[Checkout] Failed to check supplier balance, skipping check to allow potential order.');
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
                    isGuest: true, // Restrict Guest Login
                    referralCode: `GUEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                }
            });
        }

        // 2.6 Optimistic Nickname Validation (Fast cache fetch)
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
        } catch (e) {
            // Ignore error so checkout doesn't freeze
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
                gameUserName: resolvedNickname,
                gameUserId: gameId,
                gameUserServerId: serverId,
            }
        });

        if (!paymentMethod) throw new BadRequestException('Metode pembayaran harus dipilih');
        if (!whatsapp) throw new BadRequestException('Nomor WhatsApp diperlukan');

        // 4. Request Tripay Payment
        const tripayPayload = {
            method: paymentMethod,
            merchant_ref: order.orderNumber,
            amount: Math.ceil(sellPrice), // Ensure integer rounding matches frontend
            customer_name: gameId || 'User',
            customer_email: 'customer@dagangplay.com',
            customer_phone: whatsapp,
            order_items: [
                {
                    sku: sku.supplierCode,
                    name: `${sku.product.category.name} - ${sku.product.name} - ${sku.name}`,
                    price: Math.ceil(sellPrice), // Ensure integer rounding matches frontend
                    quantity: 1
                }
            ],
            return_url: `${origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`
        };

        this.logger.log(`Initiating Tripay Request: ${order.orderNumber} via ${paymentMethod}`);
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

        // 6. Send WhatsApp Notification (Async - Don't block response)
        this.whatsappService.sendOrderNotification(
            whatsapp,
            order.orderNumber,
            `${sku.product.name} - ${sku.name}`,
            sellPrice,
            tripayRes.data.checkout_url
        ).catch(err => this.logger.error(`Failed to send WA: ${err.message}`));

        // 7. Notify Admin (Async)
        this.whatsappService.sendAdminSummary(
            `🛒 *PESANAN BARU*\n` +
            `Order: ${order.orderNumber}\n` +
            `Produk: ${sku.product.name} - ${sku.name}\n` +
            `Harga: Rp ${sellPrice.toLocaleString('id-ID')}\n` +
            `Buyer: ${whatsapp}`
        ).catch(() => {});

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
                payment: true
            }
        });

        if (!order) throw new BadRequestException('Pesanan tidak ditemukan');

        return order;
    }

    async findOrdersByWhatsApp(phone: string) {
        const user = await this.prisma.user.findFirst({
            where: { phone }
        });

        if (!user) throw new BadRequestException('Nomor WhatsApp ini belum memiliki riwayat pesanan');

        return this.prisma.order.findMany({
            where: { userId: user.id },
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    async getStoreConfig(host?: string, merchantSlug?: string) {
        const hostWithoutPort = host?.split(':')[0] || '';
        const isMainDomain = !host || 
                            hostWithoutPort.includes('localhost') || 
                            hostWithoutPort.includes('127.0.0.1') || 
                            hostWithoutPort.includes('dagangplay.com') || 
                            hostWithoutPort.includes('trycloudflare.com');

        // 1. Find Merchant
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

    async resolveCustomDomain(domain: string) {
        const domainWithoutPort = domain.split(':')[0];
        const merchant = await this.prisma.merchant.findFirst({
            where: { domain: domainWithoutPort }
        });
        if (!merchant) return { slug: null };
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

    /**
     * Layanan terpisah (Separated Layer) untuk validasi Nickname ke API Eksternal.
     * Tidak membekukan proses Checkout saat timeout.
     */
    async validateNickname(productId: string, gameId: string, serverId?: string) {
        // 1. Pengecekan Cepat di Database (Cache First)
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
        } catch (e) {
            this.logger.error(`[GameValidation] Cache read error: ${e}`);
        }

        // 2. Fetch ke API Eksternal (Lapis Terpisah)
        try {
            // TODO: Integrasikan dengan axios ke API penyedia nickname (contoh: Vipayment, dll)
            // Menggunakan timeout() agar tidak menggantung (Hanging Request)
            const isMockExternalSuccess = true;
            
            if (!isMockExternalSuccess) {
                throw new Error("Layanan Eksternal Sedang Gangguan");
            }

            const externalNickname = `Pemain ${gameId}`; // Dummy name for mock response

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 3);

            // 3. Revalidasi Database / Sinkronisasi Cache
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

            // Simpan Analitik Pengecekan 
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

        } catch (err) {
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

            // JANGAN kembalikan Error 500! Kembalikan status info agar Frontend bisa tetap lanjut.
            return { 
                success: false, 
                nickname: 'Checking...', 
                message: 'Pengecekan akun game sedang gangguan, tapi Anda tetap dapat melanjutkan pesanan.' 
            };
        }
    }
}
