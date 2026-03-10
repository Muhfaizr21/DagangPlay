"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const merchants = await prisma.merchant.findMany({
        select: { slug: true, name: true, contactEmail: true }
    });
    console.log(JSON.stringify(merchants, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check_merchants.js.map