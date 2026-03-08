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
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Seeding Mock Transactions...');
    const sa = await prisma.user.findFirst({ where: { isOfficial: true } });
    if (!sa)
        throw new Error("Super Admin not found. Run standard seed first.");
    const merchant = await prisma.merchant.findFirst({ where: { isOfficial: true } });
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
        const isSuccess = Math.random() > 0.2;
        const orderNumber = `TRX-${Math.floor(Math.random() * 1000000)}`;
        await prisma.order.create({
            data: {
                orderNumber,
                userId: sa.id,
                merchantId: merchant.id,
                productId: product.id,
                productSkuId: sku.id,
                productName: product.name,
                productSkuName: sku.name,
                basePrice: sku.basePrice,
                sellingPrice: sku.sellingPrice,
                totalPrice: sku.sellingPrice,
                paymentStatus: isSuccess ? client_1.OrderPaymentStatus.PAID : client_1.OrderPaymentStatus.PENDING,
                fulfillmentStatus: isSuccess ? client_1.OrderFulfillmentStatus.SUCCESS : client_1.OrderFulfillmentStatus.FAILED,
                paymentMethod: client_1.PaymentMethod.QRIS,
                createdAt: new Date(new Date().getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
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
//# sourceMappingURL=seed-tx.js.map