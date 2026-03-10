const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🏗️ Creating new Merchant Account...');

    const email = 'merchant@dagangplay.com';
    const password = 'merchant123';
    const name = 'Faizan Gaming Store';
    const merchantSlug = 'faizan-gaming';

    // 1. Create the User (Owner)
    const owner = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            role: 'MERCHANT',
            status: 'ACTIVE'
        },
        create: {
            email,
            password,
            name,
            role: 'MERCHANT',
            status: 'ACTIVE',
            referralCode: 'REF-FAIZAN-STORE'
        }
    });

    // 2. Create the Merchant
    const merchant = await prisma.merchant.upsert({
        where: { slug: merchantSlug },
        update: {
            ownerId: owner.id,
            plan: 'SUPREME',
            status: 'ACTIVE'
        },
        create: {
            name,
            slug: merchantSlug,
            ownerId: owner.id,
            domain: 'faizangaming.id',
            plan: 'SUPREME',
            status: 'ACTIVE'
        }
    });

    console.log('\n✅ Merchant Account Successfully Created!');
    console.log('----------------------------------------');
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log(`Merchant : ${merchant.name} (${merchant.slug})`);
    console.log(`Plan     : ${merchant.plan}`);
    console.log('----------------------------------------');
    console.log('Anda sekarang bisa login menggunakan akun ini di dashboard admin-reseller.');
}

main()
    .catch((e) => {
        console.error('❌ Error creating merchant:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
