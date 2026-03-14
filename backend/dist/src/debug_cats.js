"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const cats = await prisma.category.findMany({
        include: { _count: { select: { products: true } } }
    });
    console.log(JSON.stringify(cats.map(c => ({ n: c.name, p: c._count.products, s: c.slug })), null, 2));
    await prisma.$disconnect();
}
main();
//# sourceMappingURL=debug_cats.js.map