const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding SaaS Plan Features based on plan.md...');

    const planFeatures = {
        PRO: {
            description: "Potensi Profit Hingga Rp5jt/bln",
            maxProducts: 50,
            customDomain: true,
            multiUser: false,
            whiteLabel: false,
            price: 74917,
            customFeatures: [
                "Akses Semua Produk",
                "Harga Modal Murah",
                "Tanpa Deposit",
                "BONUS Domain (2 Pilihan)",
                "Website Fast",
                "Kustomisasi Website",
                "Optimasi SEO & Pixel",
                "Manajemen Kupon Diskon"
            ]
        },
        LEGEND: {
            description: "Potensi Profit Hingga Rp15jt/bln",
            maxProducts: 500,
            customDomain: true,
            multiUser: true,
            whiteLabel: false,
            price: 82250,
            customFeatures: [
                "Akses Semua Produk",
                "Harga Modal Lebih Murah",
                "Tanpa Deposit",
                "BONUS Domain (2 Pilihan)",
                "Website Faster",
                "Kustomisasi Website",
                "Optimasi SEO & Pixel",
                "Manajemen Kupon Diskon",
                "Variasi Template Website"
            ]
        },
        SUPREME: {
            description: "Potensi Profit Hingga Rp30jt/bln",
            maxProducts: 99999,
            customDomain: true,
            multiUser: true,
            whiteLabel: true,
            price: 99917,
            customFeatures: [
                "Akses Semua Produk",
                "Harga Modal Paling Murah",
                "Tanpa Deposit",
                "BONUS Domain (12 Pilihan)",
                "Website Super Fast",
                "Kustomisasi Website",
                "Optimasi SEO & Pixel",
                "Manajemen Kupon Diskon",
                "Variasi Template Website",
                "Dapat Domain TLD",
                "Reseller Academy",
                "Fitur Flash Sale",
                "Penarikan Saldo Instan",
                "Kustomisasi Detail Produk",
                "Build Your APK",
                "Prioritized Support (WhatsApp)"
            ]
        }
    };

    await prisma.systemSetting.upsert({
        where: { key: 'saas_plan_features' },
        update: {
            value: JSON.stringify(planFeatures),
            updatedBy: 'seeder'
        },
        create: {
            key: 'saas_plan_features',
            value: JSON.stringify(planFeatures),
            group: 'SAAS',
            updatedBy: 'seeder'
        }
    });

    console.log('✅ Successfully seeded saas_plan_features!');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
