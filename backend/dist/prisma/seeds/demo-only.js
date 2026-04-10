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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
require("dotenv/config");
async function main() {
    const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    console.log('--- SYNCING DEMO ACCOUNT & DATA ---');
    const email = 'demo@dagangplay.com';
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log('Demo user already exists. Updating password...');
        const password = await bcrypt.hash('demo123', 10);
        await prisma.user.update({ where: { id: user.id }, data: { password } });
    }
    else {
        const password = await bcrypt.hash('demo123', 10);
        user = await prisma.user.create({
            data: {
                name: 'Demo Merchant',
                email,
                phone: '081234567890',
                password,
                role: client_1.Role.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
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
                status: client_1.MerchantStatus.ACTIVE,
                plan: client_1.MerchantPlan.SUPREME,
                isOfficial: false,
                ownerId: user.id,
                escrowBalance: 2500000,
                domain: 'demo.dagangplay.com'
            }
        });
        console.log('Demo merchant created.');
    }
    else {
        await prisma.merchant.update({ where: { id: merchant.id }, data: { escrowBalance: 2500000 } });
        console.log('Demo merchant balance refreshed.');
    }
    const orderCount = await prisma.order.count({ where: { merchantId: merchant.id } });
    if (orderCount < 5) {
        console.log('Creating 15 Mock Orders for Demo...');
        const skus = await prisma.productSku.findMany({ include: { product: true }, take: 5 });
        const customers = await prisma.user.findMany({ take: 5 });
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
                        priceTierUsed: client_1.PriceTier.SUPREME,
                        basePrice: sku.basePrice,
                        sellingPrice: sku.priceSupreme,
                        totalPrice: sku.priceSupreme,
                        gameUserId: '12345678',
                        quantity: 1,
                        paymentMethod: client_1.PaymentMethod.TRIPAY_QRIS,
                        paymentStatus: isPaid ? client_1.OrderPaymentStatus.PAID : client_1.OrderPaymentStatus.PENDING,
                        fulfillmentStatus: isPaid ? client_1.OrderFulfillmentStatus.SUCCESS : client_1.OrderFulfillmentStatus.PENDING,
                        createdAt: date,
                        paidAt: isPaid ? date : null,
                        completedAt: isPaid ? date : null
                    }
                });
            }
            console.log('Mock orders created.');
        }
        else {
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
//# sourceMappingURL=demo-only.js.map