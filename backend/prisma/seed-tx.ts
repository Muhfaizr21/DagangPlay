import { PrismaClient, PaymentMethod, OrderPaymentStatus, OrderFulfillmentStatus, PaymentProvider } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Mock Transactions...');

    // Get Super Admin
    const sa = await prisma.user.findFirst({ where: { isOfficial: true } });
    if (!sa) throw new Error("Super Admin not found. Run standard seed first.");

    const merchant = await prisma.merchant.findFirst({ where: { isOfficial: true } });

    // Get first product and sku, if not exist, we'll dummy it.
    let category = await prisma.category.findFirst({ where: { slug: 'mobile-legends' } });
    if (!category) {
        category = await prisma.category.create({
            data: { name: 'Mobile Legends', slug: 'mobile-legends' },
        });
    }

    let product = await prisma.product.findFirst({ where: { slug: 'ml-diamonds' } });
    if (!product) {
        product = await prisma.product.create({
            data: { name: 'MLBB Diamonds', slug: 'ml-diamonds', categoryId: category.id },
        });
    }

    // Create a dummy supplier
    let supplier = await prisma.supplier.findFirst({ where: { code: 'DIGIFLAZZ' } });
    if (!supplier) {
        supplier = await prisma.supplier.create({
            data: { name: 'Digiflazz', code: 'DIGIFLAZZ' }
        });
    }

    let sku = await prisma.productSku.findFirst({ where: { supplierCode: 'ML86' } });
    if (!sku) {
        sku = await prisma.productSku.create({
            data: {
                productId: product.id,
                supplierId: supplier.id,
                name: '86 Diamonds',
                supplierCode: 'ML86',
                basePrice: 20000,
                sellingPrice: 25000,
            }
        });
    }

    for (let i = 0; i < 5; i++) {
        const isSuccess = Math.random() > 0.2; // 80% success rate
        const orderNumber = `TRX-${Math.floor(Math.random() * 1000000)}`;

        await prisma.order.create({
            data: {
                orderNumber,
                userId: sa.id,
                merchantId: merchant!.id,
                productId: product.id,
                productSkuId: sku.id,
                productName: product.name,
                productSkuName: sku.name,
                basePrice: sku.basePrice,
                sellingPrice: sku.sellingPrice,
                totalPrice: sku.sellingPrice,
                paymentStatus: isSuccess ? OrderPaymentStatus.PAID : OrderPaymentStatus.PENDING,
                fulfillmentStatus: isSuccess ? OrderFulfillmentStatus.SUCCESS : OrderFulfillmentStatus.FAILED,
                paymentMethod: PaymentMethod.QRIS,
                createdAt: new Date(new Date().getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last 7 days
            }
        });
    }

    console.log('✅ 5 Mock Transactions Seeded');
}

main()
    .catch((e) => {
        console.error('❌ Seeder error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
