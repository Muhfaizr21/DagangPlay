const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function run() {
    try {
        const hashedPassword = await bcrypt.hash('StaffPass123!', 10);
        const user = await prisma.user.create({
            data: {
                name: "Test Add Staff",
                email: `test.${Date.now()}@dagangplay.com`,
                password: hashedPassword,
                role: "ADMIN_STAFF",
                adminPermissions: ["manage_products"],
                status: 'ACTIVE',
                isVerified: true,
                referralCode: `ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });
        console.log("Success:", user.id);
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
