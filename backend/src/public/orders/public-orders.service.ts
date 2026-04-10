import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
import { Prisma, Role } from '@prisma/client';

import { WhatsappService } from '../../common/notifications/whatsapp.service';
import { PublicOtpService } from './otp.service';

@Injectable()
export class PublicOrdersService {
  private readonly logger = new Logger(PublicOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private tripay: TripayService,
    private digiflazz: DigiflazzService,
    private subscriptionsService: SubscriptionsService,
    private whatsappService: WhatsappService,
    private otpService: PublicOtpService,
  ) {}

  async sendResellerOtp(phone: string, merchantId: string) {
    return this.otpService.sendOtp(phone, merchantId);
  }

  async verifyResellerOtp(phone: string, merchantId: string, code: string) {
    return this.otpService.verifyOtp(phone, merchantId, code);
  }

  private mapPaymentMethod(code: string): any {
    const mapping: Record<string, string> = {
      QRISC: 'TRIPAY_QRIS',
      BCAVA: 'TRIPAY_VA_BCA',
      BNIVA: 'TRIPAY_VA_BNI',
      BRIVA: 'TRIPAY_VA_BRI',
      MANDIRIVA: 'TRIPAY_VA_MANDIRI',
      PERMATAVA: 'TRIPAY_VA_PERMATA',
      GOPAY: 'TRIPAY_GOPAY',
      OVO: 'TRIPAY_OVO',
      DANA: 'TRIPAY_DANA',
      SHOPEEPAY: 'TRIPAY_SHOPEEPAY',
      ALFAMART: 'TRIPAY_ALFAMART',
      INDOMARET: 'TRIPAY_INDOMARET',
    };
    return mapping[code] || 'TRIPAY_QRIS';
  }

  async createCheckout(
    body: any,
    host?: string,
    origin?: string,
    merchantSlug?: string,
  ) {
    const { skuId, gameId, serverId, whatsapp, paymentMethod, promoCode } =
      body;

    // 0. MERCHANT IDENTIFICATION (Move up for tenant-bound logic)
    const targetMerchant = await this.prisma.merchant.findFirst({
      where: {
        OR: [
          merchantSlug ? { slug: merchantSlug } : {},
          { domain: host },
          { slug: host?.split('.')[0] },
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });

    let merchant = targetMerchant;
    if (!merchant) {
      merchant = await this.prisma.merchant.findFirst({
        where: { isOfficial: true, status: 'ACTIVE' },
      });
    }

    if (!merchant || merchant.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Toko tidak ditemukan atau sedang ditangguhkan',
      );
    }

    // 0.5. Reseller Security Check (Move up for early failure)
    const userCheck = await this.prisma.user.findFirst({
      where: {
        phone: whatsapp,
        merchantId: merchant.id,
        role: Role.RESELLER,
        status: 'ACTIVE',
      },
    });
    if (
      userCheck &&
      !this.otpService.isVerified(whatsapp, merchant.id, body.otpToken)
    ) {
      throw new BadRequestException(
        'Verifikasi reseller diperlukan (OTP tidak valid atau kadaluarsa).',
      );
    }
    // 1. Get the SKU details
    const sku = await this.prisma.productSku.findUnique({
      where: { id: skuId },
      include: { product: { include: { category: true } } },
    });

    if (!sku || sku.status !== 'ACTIVE' || sku.product.status !== 'ACTIVE') {
      const reason =
        sku?.product.status === 'MAINTENANCE'
          ? 'Produk sedang dalam pemeliharaan (Master Maintenance)'
          : 'Produk tidak tersedia atau sedang dinonaktifkan oleh pusat';
      throw new BadRequestException(reason);
    }

    // 1.1 REAL-TIME STOCK CHECK (Supplier Side)
    const availability = await this.digiflazz.checkAvailability(
      sku.supplierCode,
    );
    if (!availability.isAvailable) {
      throw new BadRequestException(availability.reason);
    }

    // 1.2 REAL-TIME BALANCE CHECK (Supplier Side)
    try {
      const supplierBalance = await this.digiflazz.checkBalance();
      if (supplierBalance < Number(sku.basePrice)) {
        throw new BadRequestException(
          'Produk sedang dalam pemeliharaan (Stok sedang kosong di pusat)',
        );
      }
    } catch (err) {
      console.warn(
        '[Checkout] Failed to check supplier balance, skipping check to allow potential order.',
      );
    }
    // 2.3 Subscription Enforcement (SaaS Protection)
    if (merchant.planExpiredAt) {
      const now = new Date();
      if (now > merchant.planExpiredAt) {
        throw new BadRequestException(
          'Masa aktif toko ini telah berakhir. Silakan hubungi pemilik toko untuk perpanjangan.',
        );
      }
    }

    const merchantId = merchant.id;
    const merchantPlan = merchant.plan;

    // 2.1 CHECK MERCHANT CUSTOM PRICING & VISIBILITY
    const merchantOverride = await this.prisma.merchantProductPrice.findUnique({
      where: {
        merchantId_productSkuId: {
          merchantId,
          productSkuId: sku.id,
        },
      },
    });

    // Visibility Boundary check (Enforce SaaS opt-in)
    const isProductActiveForMerchant = merchantOverride
      ? merchantOverride.isActive
      : merchant.isOfficial;
    if (!isProductActiveForMerchant) {
      throw new BadRequestException(
        'Produk ini tidak tersedia di toko ini atau telah dinonaktifkan oleh pemilik toko',
      );
    }

    const basePrice = Number(sku.basePrice);

    // Retail Price (Selling Price to Customer)
    let sellPrice = merchantOverride
      ? Number(merchantOverride.customPrice)
      : Number(sku.priceNormal);

    // 2.2 RESELLER PRICING (SaaS Feature 1.1)
    // If user is a verified reseller, apply merchant-wide reseller discount
    const user = await this.prisma.user.findFirst({
      where: { phone: whatsapp, merchantId: merchant.id, status: 'ACTIVE' },
    });

    if (user && user.role === Role.RESELLER) {
      const resellerDiscountSetting =
        await this.prisma.merchantSetting.findUnique({
          where: {
            merchantId_key: {
              merchantId: merchant.id,
              key: 'RESELLER_DISCOUNT',
            },
          },
        });
      const resellerDiscount = Number(resellerDiscountSetting?.value || 0);
      if (resellerDiscount > 0) {
        sellPrice = sellPrice - resellerDiscount;
      }
    }

    // FORCE INTEGER: Consistent with Tripay amount
    sellPrice = Math.ceil(sellPrice);

    // 2.3 PROMO CODE VALIDATION & APPLICATION
    let promoCodeId: string | undefined = undefined;
    let discountAmount = 0;

    if (promoCode) {
      const now = new Date();
      const promo = await this.prisma.promoCode.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          isActive: true,
          OR: [
            { merchantId: merchant.id },
            { merchantId: null }, // Global
          ],
        },
      });

      if (!promo) {
        throw new BadRequestException(
          'Kode promo tidak valid atau tidak dapat digunakan di toko ini',
        );
      }

      // Expiry check
      if (promo.startDate && now < promo.startDate)
        throw new BadRequestException('Kode promo belum dapat digunakan');
      if (promo.endDate && now > promo.endDate)
        throw new BadRequestException('Kode promo telah kadaluarsa');

      // Quota check
      if (promo.quota !== null && promo.usedCount >= promo.quota) {
        throw new BadRequestException(
          'Kuota penggunaan kode promo telah habis',
        );
      }

      // Min Purchase check
      if (promo.minPurchase && sellPrice < promo.minPurchase) {
        throw new BadRequestException(
          `Minimal pembelian untuk promo ini adalah Rp ${promo.minPurchase.toLocaleString('id-ID')}`,
        );
      }

      // Apply discount
      if (promo.type === 'DISCOUNT_FLAT') {
        discountAmount = promo.value;
      } else if (promo.type === 'DISCOUNT_PERCENTAGE') {
        discountAmount = (sellPrice * promo.value) / 100;
        if (promo.maxDiscount) {
          discountAmount = Math.min(discountAmount, promo.maxDiscount);
        }
      }

      // Ensure discount doesn't exceed price
      discountAmount = Math.ceil(Math.min(discountAmount, sellPrice));
      sellPrice -= discountAmount;
      promoCodeId = promo.id;
    }

    // Final Profit Protection (Fix Logical Fallacy: Promo + Reseller loss + Gateway Fees)
    // We dynamically calculate the fee buffer based on Tripay channel rates
    const channels = await this.tripay.getPaymentChannels(merchant.id);
    const selectedChannel = (channels?.data || []).find(
      (c: any) => c.code === paymentMethod,
    );

    let paymentFee = 0;
    if (selectedChannel) {
      // Formula: (Price * %Fee) + FlatFee
      paymentFee = Math.ceil(
        sellPrice * (selectedChannel.fee_percent / 100) +
          selectedChannel.fee_flat,
      );
    } else {
      // Safety fallback if channel not found: use a safe average VA fee
      paymentFee = 5000;
    }

    const minimumNetProfit = 200; // The actual target profit AFTER all fees
    const absoluteFloor = Number(sku.basePrice) + paymentFee + minimumNetProfit;

    sellPrice = Math.max(absoluteFloor, Math.ceil(sellPrice));

    // 2.2 MODAL PRICE RESOLUTION (Plan Tiering Logic)
    // Resolve dynamic tier based on merchant's active plan
    const mapping = await this.prisma.planTierMapping.findUnique({
      where: { plan: merchantPlan || 'PRO' }, // Fallback to PRO as baseline
    });
    const activeTier = mapping?.tier || 'PRO';

    let modalPrice = Number(sku.pricePro); // PRO is the new Minimum
    let tierUsed = activeTier;

    if (merchantOverride && merchantOverride.customModalPrice) {
      // ADMIN OVERRIDE (Wholesale Discount)
      modalPrice = Number(merchantOverride.customModalPrice);
      tierUsed = 'SPECIAL_OVERRIDE' as any;
    } else {
      // DYNAMIC PLAN TIERING (NORMAL is removed)
      if (activeTier === 'PRO') modalPrice = Number(sku.pricePro);
      else if (activeTier === 'LEGEND') modalPrice = Number(sku.priceLegend);
      else if (activeTier === 'SUPREME') modalPrice = Number(sku.priceSupreme);
      else modalPrice = Number(sku.pricePro); // Safety fallback to PRO
    }

    // FIX G: Validate required fields BEFORE creating any DB record (prevent zombie orders)
    if (!paymentMethod)
      throw new BadRequestException('Metode pembayaran harus dipilih');
    if (!whatsapp) throw new BadRequestException('Nomor WhatsApp diperlukan');

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2.5 Ensure User (Member) Exists for this Merchant
    let guestUser = await this.prisma.user.findFirst({
      where: { phone: whatsapp, merchantId },
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
          referralCode: `GUEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
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
            serverId: serverId || '',
          },
        },
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
        priceTierUsed: tierUsed as any,
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
        whatsapp, // Ensure whatsapp is included if your schema supports it
        promoCodeId,
        discountAmount,
      },
    });

    // 3.1 Increment Promo Usage Count ATOMICALLY
    if (promoCodeId) {
      await this.prisma.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      });

      await this.prisma.promoUsage.create({
        data: {
          promoCodeId,
          userId: guestUser.id,
          orderId: order.id,
          discountAmount,
        },
      });
    }

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
          quantity: 1,
        },
      ],
      return_url: `${origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/invoice/${order.orderNumber}`,
    };

    this.logger.log(
      `Initiating Tripay Request: ${order.orderNumber} via ${paymentMethod}`,
    );
    const tripayRes = await this.tripay.requestTransaction(
      tripayPayload,
      merchantId,
    );

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
        tripayResponse: tripayRes.data, // Storing everything!
      },
    });

    // 6. Send WhatsApp Notification (Async - Don't block response)
    this.whatsappService
      .sendOrderNotification(
        whatsapp,
        order.orderNumber,
        `${sku.product.name} - ${sku.name}`,
        sellPrice,
        tripayRes.data.checkout_url,
      )
      .catch((err) => this.logger.error(`Failed to send WA: ${err.message}`));

    // 7. Notify Admin (Async)
    this.whatsappService
      .sendAdminSummary(
        `🛒 *PESANAN BARU*\n` +
          `Order: ${order.orderNumber}\n` +
          `Produk: ${sku.product.name} - ${sku.name}\n` +
          `Harga: Rp ${sellPrice.toLocaleString('id-ID')}\n` +
          `Buyer: ${whatsapp}`,
      )
      .catch(() => {});

    return {
      success: true,
      orderNumber: order.orderNumber,
      payment: tripayRes.data,
    };
  }

  /**
   * Reversal Profit Merchant jika order Gagal/Batal tapi sudah terbayar
   */
  async reverseCommission(orderId: string, tx?: Prisma.TransactionClient) {
    // FIX C: Query BOTH pending (in escrow) and settled (in available) commissions
    const db = tx || this.prisma;

    const commissions = await db.commission.findMany({
      where: { orderId, status: { in: ['PENDING', 'SETTLED'] } },
    });

    if (commissions.length === 0) return;

    const work = async (innerTx: Prisma.TransactionClient) => {
      for (const comm of commissions) {
        // FIX C: Deduct from correct merchant ledger field, not user.balance
        const merchant = await innerTx.merchant.findFirst({
          where: { ownerId: comm.userId },
        });

        if (merchant) {
          if (comm.status === 'PENDING') {
            const updated = await innerTx.merchant.update({
              where: { id: merchant.id },
              data: { escrowBalance: { decrement: comm.amount } },
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
                escrowAfter: updated.escrowBalance,
              },
            });
          } else if (comm.status === 'SETTLED') {
            const updated = await innerTx.merchant.update({
              where: { id: merchant.id },
              data: { availableBalance: { decrement: comm.amount } },
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
                escrowAfter: updated.escrowBalance,
              },
            });
          }
        }

        await innerTx.commission.update({
          where: { id: comm.id },
          data: { status: 'CANCELLED' },
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
        payment: true,
      },
    });

    if (!order) throw new BadRequestException('Pesanan tidak ditemukan');

    return order;
  }

  async findOrdersByWhatsApp(phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user)
      throw new BadRequestException(
        'Nomor WhatsApp ini belum memiliki riwayat pesanan',
      );

    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: { payment: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async checkResellerStatus(phone: string, merchantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { phone, merchantId },
    });

    if (!user || user.role !== Role.RESELLER) {
      return { isReseller: false };
    }

    const discountSetting = await this.prisma.merchantSetting.findUnique({
      where: {
        merchantId_key: { merchantId: merchantId, key: 'RESELLER_DISCOUNT' },
      },
    });

    return {
      isReseller: true,
      discount: Number(discountSetting?.value || 0),
    };
  }

  async getStoreConfig(host?: string, merchantSlug?: string) {
    const hostWithoutPort = host?.split(':')[0] || '';
    const isMainDomain =
      !host ||
      hostWithoutPort.includes('localhost') ||
      hostWithoutPort.includes('127.0.0.1') ||
      hostWithoutPort.includes('dagangplay.com') ||
      hostWithoutPort.includes('trycloudflare.com');

    // 1. Find Merchant
    const merchant =
      isMainDomain && !merchantSlug
        ? null
        : await this.prisma.merchant.findFirst({
            where: {
              OR: [
                merchantSlug ? { slug: merchantSlug } : {},
                { domain: hostWithoutPort },
                !isMainDomain ? { slug: hostWithoutPort.split('.')[0] } : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          });

    const targetMerchant =
      merchant ||
      (await this.prisma.merchant.findFirst({
        where: { isOfficial: true, status: 'ACTIVE' },
      }));

    if (!targetMerchant) {
      return {
        name: 'DagangPlay',
        logo: null,
        whiteLabel: false,
        plan: 'FREE',
        isOfficial: true,
      };
    }

    // 2. Get Features
    const features = await this.subscriptionsService.getMerchantPlanFeatures(
      targetMerchant.id,
    );

    if (!targetMerchant.isOfficial) {
      if (
        targetMerchant.status === 'SUSPENDED' ||
        targetMerchant.status === 'INACTIVE'
      ) {
        return {
          isSuspended: true,
          statusCode: 403,
          name: targetMerchant.name,
          message: 'Toko sedang dalam perbaikan / ditangguhkan',
        };
      }
      if (features.isExpired) {
        return {
          isExpired: true,
          statusCode: 403,
          name: targetMerchant.name,
          message: 'Masa aktif toko ini telah berakhir',
        };
      }
    }

    console.log(
      `[PublicOrdersService] getStoreConfig: host=${host}, selectedMerchant=${targetMerchant.name}, theme=${JSON.stringify((targetMerchant.settings as any)?.theme)}`,
    );

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
      theme: (targetMerchant.settings as any)?.theme || { active: 'dark' },
    };
  }

  async resolveCustomDomain(domain: string) {
    const domainWithoutPort = domain.split(':')[0];
    const merchant = await this.prisma.merchant.findFirst({
      where: { domain: domainWithoutPort },
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
        domain: true,
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
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
            serverId: serverId || '',
          },
        },
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
        throw new Error('Layanan Eksternal Sedang Gangguan');
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
            serverId: serverId || '',
          },
        },
        update: { nickname: externalNickname, expiresAt, cachedAt: new Date() },
        create: {
          productId,
          gameUserId: gameId,
          serverId: serverId || '',
          nickname: externalNickname,
          expiresAt,
        },
      });

      // Simpan Analitik Pengecekan
      await this.prisma.gameValidation.create({
        data: {
          productId,
          gameUserId: gameId,
          serverId: serverId || '',
          nickname: externalNickname,
          isValid: true,
        },
      });

      return { success: true, nickname: externalNickname, fromCache: false };
    } catch (err) {
      this.logger.warn(
        `[GameValidation] API Timeout / Gangguan. Returning fallback.`,
      );

      await this.prisma.gameValidation.create({
        data: {
          productId,
          gameUserId: gameId,
          serverId: serverId || '',
          nickname: 'N/A',
          isValid: false,
        },
      });

      // JANGAN kembalikan Error 500! Kembalikan status info agar Frontend bisa tetap lanjut.
      return {
        success: false,
        nickname: 'Checking...',
        message:
          'Pengecekan akun game sedang gangguan, tapi Anda tetap dapat melanjutkan pesanan.',
      };
    }
  }
}
