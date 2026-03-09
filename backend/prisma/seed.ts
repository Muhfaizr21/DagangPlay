import { PrismaClient, Role, UserStatus, MerchantStatus, MerchantPlan, MerchantMemberRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seeder...');

    // 1. Create Super Admin User
    const existingSuperAdmin = await prisma.user.findUnique({
        where: { email: 'superadmin@dagangplay.com' },
    });

    if (existingSuperAdmin) {
        console.log('✅ Super Admin account already exists.');
        return;
    }

    // Create Super Admin User
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@dagangplay.com',
            password: 'dagangplayadmin2026', // In production, this should be a hashed password (e.g. using bcrypt)
            name: 'Super Admin DagangPlay',
            username: 'dagangplay_official',
            phone: '081234567890',
            role: Role.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            isVerified: true,
            isOfficial: true, // Mark as official DagangPlay account
        },
    });

    console.log(`👤 Super Admin created: ${superAdmin.email}`);

    // 2. Create the Official Merchant (DagangPlay's own store)
    const officialMerchant = await prisma.merchant.create({
        data: {
            name: 'DagangPlay Official Store',
            slug: 'dagangplay',
            description: 'Official store of DagangPlay Platform',
            contactEmail: 'support@dagangplay.com',
            status: MerchantStatus.ACTIVE,
            plan: MerchantPlan.SUPREME, // Highest plan
            isOfficial: true,
            ownerId: superAdmin.id,
        },
    });

    console.log(`🏪 Official Merchant created: ${officialMerchant.name}`);

    // 3. Link Super Admin to the Official Merchant and add as Merchant Member
    await prisma.user.update({
        where: { id: superAdmin.id },
        data: { merchantId: officialMerchant.id },
    });

    await prisma.merchantMember.create({
        data: {
            merchantId: officialMerchant.id,
            userId: superAdmin.id,
            role: MerchantMemberRole.OWNER,
        },
    });

    console.log('🔗 Super Admin linked to Official Merchant.');
    console.log('🎉 Seeding finished.');
    console.log('--------------------------------------------------');
    console.log('📧 Login Email    : superadmin@dagangplay.com');
    console.log('🔑 Login Password : dagangplayadmin2026');
    console.log('--------------------------------------------------');
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
