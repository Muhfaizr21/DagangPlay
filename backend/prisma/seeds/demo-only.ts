import { PrismaClient, Role, UserStatus, MerchantStatus, MerchantPlan, PriceTier, OrderPaymentStatus, OrderFulfillmentStatus, PaymentMethod } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new (PrismaClient as any)({ adapter });
    
    console.log('--- SYNCING DEMO ACCOUNT & DATA ---');

    const email = 'demo@dagangplay.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        console.log('Demo user already exists. Updating password...');
        const password = await bcrypt.hash('demo123', 10);
        await prisma.user.update({ where: { id: user.id }, data: { password } });
    } else {
        const password = await bcrypt.hash('demo123', 10);
        user = await prisma.user.create({
            data: {
                name: 'Demo Merchant',
                email,
                phone: '081234567890',
                password,
                role: Role.MERCHANT,
                status: UserStatus.ACTIVE,
                referralCode: 'DEMOPLAY'
            }
        });
        console.log('Demo user created.');
    }

    let merchant = await prisma.merchant.findFirst({ where: { ownerId: user.id } });

    if (!merchant) {
        merchant = await prisma.merchant.create({
            data: {
                name: 'Demo DagangPlay Store',
                slug: 'demo-store',
                status: MerchantStatus.ACTIVE,
                plan: MerchantPlan.SUPREME,
                isOfficial: false,
                ownerId: user.id,
                escrowBalance: 2500000,
                domain: 'demo.dagangplay.com'
            }
        });
        console.log('Demo merchant created.');
    } else {
        // Update balance to ensure it's not empty
        await prisma.merchant.update({ where: { id: merchant.id }, data: { escrowBalance: 2500000 } });
        console.log('Demo merchant balance refreshed.');
    }

    // Add Mock Orders if none exist
    const orderCount = await prisma.order.count({ where: { merchantId: merchant.id } });
    if (orderCount < 5) {
        console.log('Creating 15 Mock Orders for Demo...');
        const skus: any[] = await prisma.productSku.findMany({ include: { product: true }, take: 5 });
        const customers: any[] = await prisma.user.findMany({ take: 5 });

        if (skus.length > 0 && customers.length > 0) {
            for (let i = 0; i < 15; i++) {
                const sku = skus[Math.floor(Math.random() * skus.length)];
                const customer = customers[Math.floor(Math.random() * customers.length)];
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 20));

                const isPaid = Math.random() > 0.3;
                
                await prisma.order.create({
                    data: {
                        orderNumber: `DEMO-${Date.now()}-${i}`,
                        userId: customer.id,
                        merchantId: merchant.id,
                        productId: sku.productId,
                        productSkuId: sku.id,
                        productName: sku.product.name,
                        productSkuName: sku.name,
                        priceTierUsed: PriceTier.SUPREME,
                        basePrice: sku.basePrice,
                        sellingPrice: sku.priceSupreme,
                        totalPrice: sku.priceSupreme,
                        gameUserId: '12345678',
                        quantity: 1,
                        paymentMethod: PaymentMethod.TRIPAY_QRIS,
                        paymentStatus: isPaid ? OrderPaymentStatus.PAID : OrderPaymentStatus.PENDING,
                        fulfillmentStatus: isPaid ? OrderFulfillmentStatus.SUCCESS : OrderFulfillmentStatus.PENDING,
                        createdAt: date,
                        paidAt: isPaid ? date : null,
                        completedAt: isPaid ? date : null
                    }
                });
            }
            console.log('Mock orders created.');
        } else {
            console.warn('Cannot create mock orders: No SKUs or Customers found in DB.');
        }
    }

    console.log('--- SYNC COMPLETE ---');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
