import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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
