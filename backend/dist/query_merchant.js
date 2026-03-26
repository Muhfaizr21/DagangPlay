"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const merchant = await prisma.merchant.findFirst();
    console.log("Merchant:", merchant?.slug);
    if (merchant) {
        const prices = await prisma.merchantProductPrice.findMany({
            where: { merchantId: merchant.id, isActive: false }
        });
        console.log("Inactive SKUs count:", prices.length);
        console.log(prices[0]);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=query_merchant.js.map