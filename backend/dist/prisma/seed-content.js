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
    console.log('🌱 Starting Content Seeder...');
    const officialMerchant = await prisma.merchant.findFirst({
        where: { isOfficial: true }
    });
    if (!officialMerchant) {
        console.log('❌ Official Merchant not found. Please run main seeder first.');
        return;
    }
    const merchantId = officialMerchant.id;
    console.log('🖼️  Seeding Banners...');
    const banners = [
        {
            title: 'Promo Diamond MLBB 2026',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
            linkUrl: '/produk/mobile-legends',
            position: 'HERO',
            sortOrder: 1,
            isActive: true,
            merchantId
        },
        {
            title: 'Topup Free Fire Termurah',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
            linkUrl: '/produk/free-fire',
            position: 'HERO',
            sortOrder: 2,
            isActive: true,
            merchantId
        },
        {
            title: 'Flash Sale Weekly Diamond Pass',
            image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop',
            linkUrl: '/produk/mobile-legends',
            position: 'HERO',
            sortOrder: 3,
            isActive: true,
            merchantId
        }
    ];
    for (const banner of banners) {
        await prisma.banner.upsert({
            where: { id: `seed-banner-${banner.sortOrder}` },
            update: banner,
            create: {
                id: `seed-banner-${banner.sortOrder}`,
                ...banner
            }
        });
    }
    console.log('📢 Seeding Announcements...');
    const announcements = [
        {
            title: 'Waspada Penipuan!',
            content: 'Harap waspada terhadap pihak yang mengatasnamakan DagangPlay. Kami tidak pernah meminta password akun Anda.',
            isActive: true,
            merchantId
        },
        {
            title: 'Metode Pembayaran Baru: QRIS',
            content: 'Sekarang Anda bisa melakukan pembayaran instan melalui QRIS di DagangPlay!',
            isActive: true,
            merchantId
        }
    ];
    for (const ann of announcements) {
        await prisma.announcement.create({
            data: ann
        });
    }
    console.log('✅ Content Seeding Finished!');
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
//# sourceMappingURL=seed-content.js.map