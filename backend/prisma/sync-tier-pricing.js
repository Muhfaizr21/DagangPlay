const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Recommended Healthy Margin percentages
const MARGINS = {
    normal: 8.5,    // Retail
    pro: 6.0,       // Small Reseller
    legend: 3.5,    // Big Reseller
    supreme: 1.5    // VIP / Partner
};

async function main() {
    console.log('📈 Starting automatic tier pricing synchronization...');

    // 1. Fetch all active SKUs
    const skus = await prisma.productSku.findMany({
        where: { status: 'ACTIVE' }
    });

    console.log(`🔍 Found ${skus.length} active SKUs to update.`);

    let count = 0;
    for (const sku of skus) {
        const base = Number(sku.basePrice);

        // Calculate new prices based on margins
        const newPriceNormal = Math.ceil(base * (1 + MARGINS.normal / 100));
        const newPricePro = Math.ceil(base * (1 + MARGINS.pro / 100));
        const newPriceLegend = Math.ceil(base * (1 + MARGINS.legend / 100));
        const newPriceSupreme = Math.ceil(base * (1 + MARGINS.supreme / 100));

        // Update SKU with new prices and margin info
        await prisma.productSku.update({
            where: { id: sku.id },
            data: {
                priceNormal: newPriceNormal,
                pricePro: newPricePro,
                priceLegend: newPriceLegend,
                priceSupreme: newPriceSupreme,
                marginNormal: MARGINS.normal,
                marginPro: MARGINS.pro,
                marginLegend: MARGINS.legend,
                marginSupreme: MARGINS.supreme
            }
        });

        count++;
        if (count % 50 === 0) console.log(`🚀 Updated ${count} SKUs...`);
    }

    console.log(`✅ Successfully updated ${count} products with automatic tiered pricing.`);
    console.log(`📊 Formula Used:`);
    console.log(`   - Normal : +${MARGINS.normal}% (Eceran)`);
    console.log(`   - Pro    : +${MARGINS.pro}% (Reseller Kecil)`);
    console.log(`   - Legend : +${MARGINS.legend}% (Reseller Besar)`);
    console.log(`   - Supreme: +${MARGINS.supreme}% (Partner VIP)`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
