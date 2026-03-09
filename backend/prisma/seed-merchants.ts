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

    // Create a dummy owner to own the tenants
    const dummyOwner = await prisma.user.upsert({
        where: { email: 'dummyowner@dagangplay.com' },
        update: {},
        create: {
            email: 'dummyowner@dagangplay.com',
            password: 'hash',
            name: 'Dummy Tenant Owner',
            role: Role.RESELLER,
            status: UserStatus.ACTIVE,
        }
    });

    // 1. Tenant Pro
    const tenant1 = await prisma.merchant.upsert({
        where: { slug: 'topup-dewa' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Topup Dewa Gaming',
            slug: 'topup-dewa',
            domain: 'topupdewa.com',
            plan: MerchantPlan.LEGEND,
            status: MerchantStatus.ACTIVE,
        }
    });

    // 2. Tenant Free - Suspended
    const tenant2 = await prisma.merchant.upsert({
        where: { slug: 'budi-gaming' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Budi Gaming Store',
            slug: 'budi-gaming',
            domain: 'budigaming.id',
            plan: MerchantPlan.FREE,
            status: MerchantStatus.SUSPENDED,
        }
    });

    // 3. Tenant Starter - Pending
    const tenant3 = await prisma.merchant.upsert({
        where: { slug: 'juragan-diamond' },
        update: {},
        create: {
            ownerId: dummyOwner.id,
            name: 'Juragan Diamond',
            slug: 'juragan-diamond',
            domain: 'juragandiamond.net',
            plan: MerchantPlan.PRO,
            status: MerchantStatus.PENDING_REVIEW,
        }
    });

    // Create some resellers for tenant1
    for (let i = 1; i <= 5; i++) {
        const email = `reseller${i}@topupdewa.com`;
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: 'hash',
                name: `Reseller Dewa ${i}`,
                role: Role.RESELLER,
                status: UserStatus.ACTIVE,
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
