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
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const email = 'demo@dagangplay.com';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const password = await bcrypt.hash('demo123', 10);
        user = await prisma.user.create({
            data: {
                email,
                phone: '081234567890',
                password,
                name: 'Reseller Demo',
                username: 'resellerdemo',
                role: 'MERCHANT',
                status: 'ACTIVE',
                isVerified: true,
                referralCode: 'DEMO'
            }
        });
        console.log('Created Demo User');
    }
    let merchant = await prisma.merchant.findUnique({ where: { ownerId: user.id } });
    if (!merchant) {
        merchant = await prisma.merchant.create({
            data: {
                ownerId: user.id,
                name: 'Toko Demo DagangPlay',
                slug: 'demo',
                status: 'ACTIVE',
                plan: 'SUPREME'
            }
        });
        console.log('Created Demo Merchant');
    }
    console.log('Seeding demo data...');
    await prisma.merchant.update({
        where: { id: merchant.id },
        data: {
            availableBalance: 2450000,
            escrowBalance: 125000,
        }
    });
    const sampleSku = await prisma.productSku.findFirst({
        include: { product: true }
    });
    if (sampleSku) {
        await prisma.order.deleteMany({ where: { merchantId: merchant.id } });
        await prisma.merchantLedgerMovement.deleteMany({ where: { merchantId: merchant.id } });
        const mockOrders = [
            { customerName: 'Budi Santoso', status: 'PAID', qty: 1, amount: 45000 },
            { customerName: 'Andi Wijaya', status: 'PAID', qty: 2, amount: 120000 },
            { customerName: 'Siti Aminah', status: 'PENDING', qty: 1, amount: 15000 },
            { customerName: 'Joko Anwar', status: 'PAID', qty: 1, amount: 250000 },
            { customerName: 'Rina Melati', status: 'EXPIRED', qty: 1, amount: 75000 },
        ];
        for (const [idx, m] of mockOrders.entries()) {
            await prisma.order.create({
                data: {
                    orderNumber: `DMO-${Date.now()}-${idx}`,
                    userId: user.id,
                    merchantId: merchant.id,
                    productId: sampleSku.productId,
                    productSkuId: sampleSku.id,
                    productName: sampleSku.product.name,
                    productSkuName: sampleSku.name,
                    priceTierUsed: 'SUPREME',
                    basePrice: m.amount / m.qty,
                    sellingPrice: m.amount / m.qty,
                    totalPrice: m.amount,
                    gameUserId: `12345${idx}`,
                    quantity: m.qty,
                    paymentStatus: m.status,
                    fulfillmentStatus: m.status === 'PAID' ? 'SUCCESS' : 'PENDING',
                    createdAt: new Date(Date.now() - Math.random() * 86400000 * 5),
                }
            });
        }
        console.log('Created Mock Orders');
        await prisma.merchantLedgerMovement.create({
            data: {
                merchantId: merchant.id,
                type: 'DEBIT',
                amount: 45000,
                availableBefore: 2405000,
                availableAfter: 2450000,
                escrowBefore: 125000,
                escrowAfter: 125000,
                description: 'Penambahan saldo dari transaksi DMO-1234',
                createdAt: new Date()
            }
        });
        await prisma.merchantLedgerMovement.create({
            data: {
                merchantId: merchant.id,
                type: 'CREDIT',
                amount: 500000,
                availableBefore: 2950000,
                availableAfter: 2450000,
                escrowBefore: 125000,
                escrowAfter: 125000,
                description: 'Penarikan Dana ke Rekening BCA',
                createdAt: new Date(Date.now() - 86400000)
            }
        });
        console.log('Created Mock Ledger Movements');
    }
    const existingPromo = await prisma.promoCode.findFirst({ where: { merchantId: merchant.id, code: 'DEMOJAM' } });
    if (!existingPromo) {
        await prisma.promoCode.create({
            data: {
                merchant: { connect: { id: merchant.id } },
                name: 'Promo Demo 15%',
                code: 'DEMOJAM',
                type: 'DISCOUNT_PERCENTAGE',
                value: 15,
                maxDiscount: 50000,
                minPurchase: 100000,
                quota: 100,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000 * 30),
            }
        });
        console.log('Created Promo Code');
    }
    try {
        await prisma.flashSaleEvent.deleteMany({ where: { merchantId: merchant.id } });
        await prisma.flashSaleEvent.create({
            data: {
                merchantId: merchant.id,
                name: 'Flash Sale Merdeka',
                slug: 'fs-merdeka',
                startedAt: new Date(),
                endedAt: new Date(Date.now() + 86400000 * 2),
                status: 'ACTIVE',
            }
        });
        console.log('Created Flash Sale Event');
    }
    catch {
        console.log('Skipped Flash Sale (schema not synced yet or unsupported)');
    }
    console.log('--- SEEDING COMPLETE ---');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-demo.js.map