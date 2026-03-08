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
    console.log('🌱 Seeding Merchants & Resellers...');
    const dummyOwner = await prisma.user.upsert({
        where: { email: 'dummyowner@dagangplay.com' },
        update: {},
        create: {
            email: 'dummyowner@dagangplay.com',
            password: 'hash',
            name: 'Dummy Tenant Owner',
            role: client_1.Role.RESELLER,
            status: client_1.UserStatus.ACTIVE,
        }
    });
    const tenant1 = await prisma.merchant.upsert({
        where: { slug: 'topup-dewa' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Topup Dewa Gaming',
            slug: 'topup-dewa',
            domain: 'topupdewa.com',
            plan: client_1.MerchantPlan.PROFESSIONAL,
            status: client_1.MerchantStatus.ACTIVE,
        }
    });
    const tenant2 = await prisma.merchant.upsert({
        where: { slug: 'budi-gaming' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Budi Gaming Store',
            slug: 'budi-gaming',
            domain: 'budigaming.id',
            plan: client_1.MerchantPlan.FREE,
            status: client_1.MerchantStatus.SUSPENDED,
        }
    });
    const tenant3 = await prisma.merchant.upsert({
        where: { slug: 'juragan-diamond' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Juragan Diamond',
            slug: 'juragan-diamond',
            domain: 'juragandiamond.net',
            plan: client_1.MerchantPlan.STARTER,
            status: client_1.MerchantStatus.PENDING_REVIEW,
        }
    });
    for (let i = 1; i <= 5; i++) {
        const email = `reseller${i}@topupdewa.com`;
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: 'hash',
                name: `Reseller Dewa ${i}`,
                role: client_1.Role.RESELLER,
                status: client_1.UserStatus.ACTIVE,
                merchantId: tenant1.id,
            }
        });
    }
    console.log('✅ Mock Merchants Seeded');
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
//# sourceMappingURL=seed-merchants.js.map