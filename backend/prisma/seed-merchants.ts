import { PrismaClient, MerchantStatus, MerchantPlan, Role, UserStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Merchants & Resellers...');

    // 1. Tenant Legend (Owner 1)
    const owner1 = await prisma.user.upsert({
        where: { email: 'owner1@topupdewa.com' },
        update: {},
        create: {
            email: 'owner1@topupdewa.com',
            password: 'hash',
            name: 'Owner Dewa',
            role: Role.MERCHANT,
            status: UserStatus.ACTIVE,
            referralCode: 'REF-OWNER-1'
        }
    });

    const tenant1 = await prisma.merchant.upsert({
        where: { slug: 'topup-dewa' },
        update: {},
        create: {
            ownerId: owner1.id,
            name: 'Topup Dewa Gaming',
            slug: 'topup-dewa',
            domain: 'topupdewa.com',
            plan: MerchantPlan.LEGEND,
            status: MerchantStatus.ACTIVE,
        }
    });

    // 2. Tenant Free - Suspended (Owner 2)
    const owner2 = await prisma.user.upsert({
        where: { email: 'owner2@budigaming.id' },
        update: {},
        create: {
            email: 'owner2@budigaming.id',
            password: 'hash',
            name: 'Owner Budi',
            role: Role.MERCHANT,
            status: UserStatus.ACTIVE,
            referralCode: 'REF-OWNER-2'
        }
    });

    const tenant2 = await prisma.merchant.upsert({
        where: { slug: 'budi-gaming' },
        update: {},
        create: {
            ownerId: owner2.id,
            name: 'Budi Gaming Store',
            slug: 'budi-gaming',
            domain: 'budigaming.id',
            plan: MerchantPlan.FREE,
            status: MerchantStatus.SUSPENDED,
        }
    });

    // 3. Tenant Pro - Pending (Owner 3)
    const owner3 = await prisma.user.upsert({
        where: { email: 'owner3@juragandiamond.net' },
        update: {},
        create: {
            email: 'owner3@juragandiamond.net',
            password: 'hash',
            name: 'Owner Juragan',
            role: Role.MERCHANT,
            status: UserStatus.ACTIVE,
            referralCode: 'REF-OWNER-3'
        }
    });

    const tenant3 = await prisma.merchant.upsert({
        where: { slug: 'juragan-diamond' },
        update: {},
        create: {
            ownerId: owner3.id,
            name: 'Juragan Diamond',
            slug: 'juragan-diamond',
            domain: 'juragandiamond.net',
            plan: MerchantPlan.PRO,
            status: MerchantStatus.PENDING_REVIEW,
        }
    });

    // Create some customers for tenant1
    for (let i = 1; i <= 5; i++) {
        const email = `customer${i}@topupdewa.com`;
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: 'hash',
                name: `Customer Dewa ${i}`,
                role: Role.CUSTOMER,
                status: UserStatus.ACTIVE,
                merchantId: tenant1.id,
                referralCode: `REF-DEWA-${i}`
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
