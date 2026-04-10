import { PrismaClient, Role, UserStatus, MerchantStatus, MerchantPlan, SkuStatus, PaymentMethod, OrderPaymentStatus, OrderFulfillmentStatus, PriceTier } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL || "postgresql://muhfaiizr@localhost:5432/dagangplayd?schema=public";
console.log('DATABASE_URL:', dbUrl);

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('--- CLEANING DATABASE ---');

    const tables = [
        'TierPriceHistory', 'TierPricingRule', 'Payment', 'BalanceTransaction',
        'OrderFulfillmentLog', 'OrderStatusHistory', 'Order', 'MerchantProductOverride',
        'MerchantProductPrice', 'ProductReview', 'GameServer', 'ProductSku', 'Product',
        'Category', 'AuditLog', 'MerchantMember', 'Merchant', 'UserSession',
        'OtpVerification', 'LoginAttempt', 'UserActivityLog', 'UserFavorite',
        'UserProfile', 'User', 'SupplierBalanceHistory', 'SupplierLog', 'Supplier',
        'IPBlacklist', 'FraudDetection', 'SystemSetting', 'Banner', 'Announcement',
        'PromoUsage', 'PromoCode', 'DeviceTrusted', 'ApiKey'
    ];

    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
        } catch (e) { }
    }

    console.log('--- DATABASE CLEANED ---');

    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('DagangPlay123!', saltRounds);

    // 1. CREATE SUPER ADMIN
    await prisma.user.create({
        data: {
            name: 'System Super Admin',
            email: 'superadmin@dagangplay.com',
            phone: '080000000000',
            password: defaultPassword,
            role: Role.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            isVerified: true,
            referralCode: 'SUPERADMIN'
        }
    });

    // 2. MERCHANTS
    const demoPassword = await bcrypt.hash('demo123', saltRounds);
    
    // Create dedicated Demo Account for landing page
    const demoUser = await prisma.user.create({
        data: {
            name: 'Demo Merchant',
            email: 'demo@dagangplay.com',
            phone: '081234567890',
            password: demoPassword,
            role: Role.MERCHANT,
            status: UserStatus.ACTIVE,
            referralCode: 'DEMOPLAY'
        }
    });

    await prisma.merchant.create({
        data: {
            name: 'Demo DagangPlay Store',
            slug: 'demo-store',
            status: MerchantStatus.ACTIVE,
            plan: MerchantPlan.SUPREME,
            isOfficial: false,
            ownerId: demoUser.id,
            escrowBalance: 2500000, // Give some demo balance
            domain: 'demo.dagangplay.com'
        }
    });

    const merchantsData = [
        { name: 'Fantasi Gamer', email: 'fantasi@m.com', slug: 'fantasi-gamer', domain: 'fantasigamer.com', plan: MerchantPlan.SUPREME, status: MerchantStatus.ACTIVE, isOfficial: false },
        { name: 'Arb Store', email: 'arb@m.com', slug: 'arb-store', domain: 'arbstore.id', plan: MerchantPlan.LEGEND, status: MerchantStatus.ACTIVE, isOfficial: false },
        { name: 'Rolly Store', email: 'rolly@m.com', slug: 'rolly-store', plan: MerchantPlan.PRO, status: MerchantStatus.ACTIVE, isOfficial: false },
        { name: 'Budi Gaming', email: 'budi@m.com', slug: 'budi-gaming', plan: MerchantPlan.PRO, status: MerchantStatus.PENDING_REVIEW, isOfficial: false },
        { name: 'DagangPlay', email: 'official@dagangplay.com', slug: 'official', plan: MerchantPlan.SUPREME, status: MerchantStatus.ACTIVE, isOfficial: true },
    ];

    const merchantRecords: any[] = [];
    for (let mt of merchantsData) {
        const user = await prisma.user.create({
            data: {
                name: `Owner ${mt.name}`,
                email: mt.email,
                phone: `081${Math.floor(Math.random() * 1000000000)}`,
                password: defaultPassword,
                role: Role.MERCHANT,
                status: UserStatus.ACTIVE,
                referralCode: mt.slug.toUpperCase().replace('-', '')
            }
        });

        const merchant = await prisma.merchant.create({
            data: {
                name: mt.name,
                slug: mt.slug,
                domain: mt.domain,
                status: mt.status,
                plan: mt.plan,
                isOfficial: mt.isOfficial,
                ownerId: user.id
            }
        });
        merchantRecords.push(merchant);
    }

    // 3. CUSTOMERS
    const customersData = [
        { name: 'Joko Widodo', email: 'joko@c.com' },
        { name: 'Agus Setiawan', email: 'agus@c.com' },
    ];
    const customerRecords: any[] = [];
    for (let cd of customersData) {
        const cust = await prisma.user.create({
            data: {
                name: cd.name,
                email: cd.email,
                password: defaultPassword,
                role: Role.CUSTOMER,
                status: UserStatus.ACTIVE,
                referralCode: `CUST${Math.floor(Math.random() * 9999)}`
            }
        });
        customerRecords.push(cust);
    }

    // 4. CATEGORIES
    const catML = await prisma.category.create({ data: { name: 'Mobile Legends', slug: 'mobile-legends', image: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' } });
    const catFF = await prisma.category.create({ data: { name: 'Free Fire', slug: 'free-fire', image: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ff.png' } });
    const catGenshin = await prisma.category.create({ data: { name: 'Genshin Impact', slug: 'genshin-impact', image: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-genshin.png' } });

    // 5. SUPPLIER
    const supplier = await prisma.supplier.create({
        data: {
            name: 'Digiflazz (Sandbox)',
            code: 'DIGIFLAZZ',
            apiUrl: 'https://api.digiflazz.com/v1',
            apiKey: 'dummy_key',
            apiSecret: 'dummy_secret',
            balance: 5000000
        }
    });

    // 6. PRODUCTS & SKUS (Detailed)
    const prodML = await prisma.product.create({
        data: {
            name: 'Mobile Legends Diamonds',
            slug: 'mlbb-diamonds',
            categoryId: catML.id,
            thumbnail: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png'
        }
    });

    const prodFF = await prisma.product.create({
        data: {
            name: 'Free Fire Diamonds',
            slug: 'free-fire-diamonds',
            categoryId: catFF.id,
            thumbnail: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ff.png'
        }
    });

    const prodGenshin = await prisma.product.create({
        data: {
            name: 'Genshin Impact Genesis Crystals',
            slug: 'genshin-cristals',
            categoryId: catGenshin.id,
            thumbnail: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-genshin.png'
        }
    });

    await prisma.productSku.createMany({
        data: [
            // MLBB SKUS
            {
                productId: prodML.id, supplierId: supplier.id, name: '86 Diamonds', supplierCode: 'ML86',
                basePrice: 19500, priceNormal: 21500, marginNormal: 2000,
                pricePro: 20500, marginPro: 1000, priceLegend: 20000, marginLegend: 500,
                priceSupreme: 19800, marginSupreme: 300, stock: 999
            },
            {
                productId: prodML.id, supplierId: supplier.id, name: '172 Diamonds', supplierCode: 'ML172',
                basePrice: 38000, priceNormal: 42000, marginNormal: 4000,
                pricePro: 40000, marginPro: 2000, priceLegend: 39000, marginLegend: 1000,
                priceSupreme: 38500, marginSupreme: 500, stock: 999
            },
            {
                productId: prodML.id, supplierId: supplier.id, name: '257 Diamonds', supplierCode: 'ML257',
                basePrice: 57000, priceNormal: 63000, marginNormal: 6000,
                pricePro: 60000, marginPro: 3000, priceLegend: 58500, marginLegend: 1500,
                priceSupreme: 57800, marginSupreme: 800, stock: 999
            },
            // FF SKUS
            {
                productId: prodFF.id, supplierId: supplier.id, name: '140 Diamonds', supplierCode: 'FF140',
                basePrice: 18000, priceNormal: 20000, marginNormal: 2000,
                pricePro: 19000, marginPro: 1000, priceLegend: 18500, marginLegend: 500,
                priceSupreme: 18200, marginSupreme: 200, stock: 999
            },
            {
                productId: prodFF.id, supplierId: supplier.id, name: '355 Diamonds', supplierCode: 'FF355',
                basePrice: 45000, priceNormal: 50000, marginNormal: 5000,
                pricePro: 48000, marginPro: 3000, priceLegend: 46500, marginLegend: 1500,
                priceSupreme: 45800, marginSupreme: 800, stock: 999
            },
            // GENSHIN SKUS
            {
                productId: prodGenshin.id, supplierId: supplier.id, name: '60 Genesis Crystals', supplierCode: 'GNR60',
                basePrice: 13500, priceNormal: 15500, marginNormal: 2000,
                pricePro: 14500, marginPro: 1000, priceLegend: 14000, marginLegend: 500,
                priceSupreme: 13800, marginSupreme: 300, stock: 999
            },
            {
                productId: prodGenshin.id, supplierId: supplier.id, name: 'Blessing of the Welkin Moon', supplierCode: 'GNW',
                basePrice: 65000, priceNormal: 75000, marginNormal: 10000,
                pricePro: 70000, marginPro: 5000, priceLegend: 68000, marginLegend: 3000,
                priceSupreme: 66000, marginSupreme: 1000, stock: 999
            }
        ]
    });

    const allSkus = await prisma.productSku.findMany({ include: { product: true } });

    // 7. ORDERS
    console.log('Creating 40 Dummy Orders...');
    for (let i = 0; i < 40; i++) {
        const merchant = merchantRecords[Math.floor(Math.random() * merchantRecords.length)];
        const customer = customerRecords[Math.floor(Math.random() * customerRecords.length)];
        const sku = allSkus[Math.floor(Math.random() * allSkus.length)];

        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // random date in last 30 days

        const order = await prisma.order.create({
            data: {
                orderNumber: `TRX-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                userId: customer.id,
                merchantId: merchant.id,
                productId: sku.productId,
                productSkuId: sku.id,
                productName: sku.product.name,
                productSkuName: sku.name,
                priceTierUsed: PriceTier.NORMAL,
                basePrice: sku.basePrice,
                sellingPrice: sku.priceNormal,
                totalPrice: sku.priceNormal,
                gameUserId: '12345678',
                paymentMethod: PaymentMethod.TRIPAY_QRIS,
                paymentStatus: OrderPaymentStatus.PAID,
                fulfillmentStatus: OrderFulfillmentStatus.SUCCESS,
                createdAt: date,
                paidAt: date,
                completedAt: date
            }
        });

        await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: customer.id,
                merchantId: merchant.id,
                method: PaymentMethod.TRIPAY_QRIS,
                amount: sku.priceNormal,
                totalAmount: sku.priceNormal,
                status: 'PAID',
                tripayReference: `T-${order.orderNumber}`,
                createdAt: date,
                paidAt: date
            }
        });
    }

    console.log('--- SEEDING COMPLETED ---');
    console.log('Login Super Admin: superadmin@dagangplay.com / DagangPlay123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
