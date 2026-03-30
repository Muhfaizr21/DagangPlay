const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const phone = '083866623090';
    const merchantId = 'cmmp0yns3000aoh9kaulgz1il';
    
    const user = await prisma.user.upsert({
        where: { phone: phone },
        update: { 
            role: 'RESELLER',
            merchantId: merchantId,
            status: 'ACTIVE'
        },
        create: {
            phone: phone,
            name: 'Reseller Test (Muhfaizr)',
            password: 'hashed_password_placeholder',
            role: 'RESELLER',
            merchantId: merchantId,
            referralCode: 'TEST_RS_01',
            status: 'ACTIVE'
        }
    });

    console.log('Upserted User:', user.phone, 'as', user.role);
    process.exit(0);
}

run();
