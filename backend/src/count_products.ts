
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const skusCount = await prisma.productSku.count();
    const topProducts = await prisma.product.findMany({ take: 5, select: { name: true } });
    console.log({ productsCount, categoriesCount, skusCount, topProducts });
}

main().catch(console.error).finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
