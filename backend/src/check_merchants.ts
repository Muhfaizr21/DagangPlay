
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const merchants = await prisma.merchant.findMany({
        select: { slug: true, name: true, contactEmail: true }
    });
    console.log(JSON.stringify(merchants, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
