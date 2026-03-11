
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncDigiflazzProducts() {
    try {
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY;
        const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';

        console.log('Using Username:', username);
        console.log('Using URL:', url);

        if (!username || !key) {
            throw new Error('Credential Digiflazz tidak ditemukan di .env');
        }

        const sign = crypto.createHash('md5').update(username + key + 'pricelist').digest('hex');

        const response = await fetch(`${url}/price-list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cmd: "prepaid",
                username: username,
                sign: sign
            })
        });

        const jsonResp = await response.json();
        console.log('Digiflazz raw response:', JSON.stringify(jsonResp).substring(0, 500));

        if (!response.ok || !jsonResp.data || !Array.isArray(jsonResp.data)) {
            throw new Error(`Digiflazz Sync Error: ${JSON.stringify(jsonResp.data || jsonResp)}`);
        }

        const items = jsonResp.data;
        console.log('Total items fetched:', items.length);

        // Ensure Supplier
        const supplier = await prisma.supplier.upsert({
            where: { code: 'DIGIFLAZZ' },
            update: {},
            create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: url, apiKey: key, apiSecret: 'SECRET' }
        });

        let updatedCount = 0;
        let newCount = 0;

        for (const item of items) {
            const isGame = item.category?.toLowerCase().includes('game') ||
                item.category === 'Games' ||
                item.type === 'Games' ||
                item.brand?.toLowerCase().includes('mobile legends') ||
                item.brand?.toLowerCase().includes('free fire');
            if (!isGame) continue;

            const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const category = await prisma.category.upsert({
                where: { slug: brandSlug },
                update: {},
                create: { name: item.brand, slug: brandSlug, isActive: true }
            });

            const productSlug = `${brandSlug}-topup`;
            const product = await prisma.product.upsert({
                where: { slug: productSlug },
                update: {},
                create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE' }
            });

            const basePrice = Number(item.price);
            const priceNormal = Math.ceil(basePrice * 1.1); // Simple 10% margin
            const pricePro = Math.ceil(basePrice * 1.08);
            const priceLegend = Math.ceil(basePrice * 1.05);
            const priceSupreme = Math.ceil(basePrice * 1.03);

            const skuRecord = await prisma.productSku.findFirst({
                where: { supplierCode: item.buyer_sku_code, supplierId: supplier.id }
            });

            const isAvailable = item.buyer_product_status && item.seller_product_status;

            if (skuRecord) {
                await prisma.productSku.update({
                    where: { id: skuRecord.id },
                    data: {
                        basePrice,
                        priceNormal,
                        status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                    }
                });
                updatedCount++;
            } else {
                await prisma.productSku.create({
                    data: {
                        productId: product.id,
                        supplierId: supplier.id,
                        name: item.product_name,
                        supplierCode: item.buyer_sku_code,
                        basePrice,
                        priceNormal,
                        pricePro,
                        priceLegend,
                        priceSupreme,
                        marginNormal: 10,
                        marginPro: 8,
                        marginLegend: 5,
                        marginSupreme: 3,
                        status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                    }
                });
                newCount++;
            }
        }

        console.log(`Sync Success: ${newCount} new, ${updatedCount} updated.`);
    } catch (err: any) {
        console.error('Sync Error:', err);
    }
}

syncDigiflazzProducts().finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
