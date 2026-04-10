require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Initializing Demo Merchant Account...');
    
    // Hash password 'demo123'
    const password = await bcrypt.hash('demo123', 10);
    
    // 1. Create/Update Demo User with MERCHANT role
    const user = await prisma.user.upsert({
        where: { email: 'demo@dagangplay.com' },
        update: {
            password: password,
            role: 'MERCHANT',
            status: 'ACTIVE',
            isVerified: true
        },
        create: {
            email: 'demo@dagangplay.com',
            password: password,
            name: 'Demo Reseller',
            role: 'MERCHANT',
            status: 'ACTIVE',
            isVerified: true,
            phone: '081234567890',
            referralCode: 'DEMOPLAY'
        }
    });

    // 2. Create/Update Demo Merchant linked to this user
    await prisma.merchant.upsert({
        where: { slug: 'demo-store' },
        update: {
            ownerId: user.id,
            status: 'ACTIVE',
            plan: 'SUPREME'
        },
        create: {
            ownerId: user.id,
            name: 'Demo Store Account',
            slug: 'demo-store',
            status: 'ACTIVE',
            plan: 'SUPREME',
            isOfficial: false
        }
    });

    console.log('✅ Demo Merchant Account Ready!');
    console.log('Email: demo@dagangplay.com');
    console.log('Password: demo123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding demo account:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
