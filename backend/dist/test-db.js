"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const cats = await prisma.category.findMany({ take: 5, include: { products: { take: 1 } } });
    console.log('Categories:', JSON.stringify(cats, null, 2));
}
main();
//# sourceMappingURL=test-db.js.map