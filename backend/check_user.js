const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findFirst({
        where: { phone: '083866623090' }
    });
    console.log('USER_FOUND:', JSON.stringify(user, null, 2));
    process.exit(0);
}

check();
