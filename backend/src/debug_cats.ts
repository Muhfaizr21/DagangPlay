import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const cats = await prisma.category.findMany({
        include: { _count: { select: { products: true } } }
    });
    console.log(JSON.stringify(cats.map(c => ({n: c.name, p: c._count.products, s: c.slug})), null, 2));
    await prisma.$disconnect();
}
main();
