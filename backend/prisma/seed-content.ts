import { PrismaClient, BannerPosition } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting Content Seeder...');

    // 1. Get Official Merchant
    const officialMerchant = await prisma.merchant.findFirst({
        where: { isOfficial: true }
    });

    if (!officialMerchant) {
        console.log('❌ Official Merchant not found. Please run main seeder first.');
        return;
    }

    const merchantId = officialMerchant.id;

    // 2. Seed Banners
    console.log('🖼️  Seeding Banners...');
    const banners = [
        {
            title: 'Promo Diamond MLBB 2026',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', // Mock game image
            linkUrl: '/produk/mobile-legends',
            position: 'HERO' as BannerPosition,
            sortOrder: 1,
            isActive: true,
            merchantId
        },
        {
            title: 'Topup Free Fire Termurah',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop', // Mock game image
            linkUrl: '/produk/free-fire',
            position: 'HERO' as BannerPosition,
            sortOrder: 2,
            isActive: true,
            merchantId
        },
        {
            title: 'Flash Sale Weekly Diamond Pass',
            image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop', // Mock game image
            linkUrl: '/produk/mobile-legends',
            position: 'HERO' as BannerPosition,
            sortOrder: 3,
            isActive: true,
            merchantId
        }
    ];

    for (const banner of banners) {
        await prisma.banner.upsert({
            where: { id: `seed-banner-${banner.sortOrder}` }, // Consistent ID for re-runs
            update: banner,
            create: {
                id: `seed-banner-${banner.sortOrder}`,
                ...banner
            }
        });
    }

    // 3. Seed Announcements
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
