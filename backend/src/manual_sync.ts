
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncAllDigiflazzProducts() {
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

        console.log('Fetching pricelist from Digiflazz...');
        const response = await fetch(`${url}/price-list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cmd: "prepaid",
                username: username,
                sign: sign
            })
        });

        let jsonResp = await response.json();
        
        if (!response.ok || !jsonResp.data || !Array.isArray(jsonResp.data)) {
            console.warn('API Limit/Error. Checking local cache...');
            const fs = require('fs');
            const path = require('path');
            const cachePath = path.join(process.cwd(), 'digiflazz-cache.json');
            if (fs.existsSync(cachePath)) {
                console.log('Using local cache from digiflazz-cache.json');
                jsonResp = { data: JSON.parse(fs.readFileSync(cachePath, 'utf8')) };
            } else {
                throw new Error(`Digiflazz Sync Error: ${JSON.stringify(jsonResp.data || jsonResp)}`);
            }
        }

        const items = jsonResp.data;
        console.log('Total items fetched:', items.length);

        // Filter only Games (Broadened to include gaming vouchers)
        const gameItems = items.filter((item: any) => {
            const cat = (item.category || '').toUpperCase();
            const brand = (item.brand || '').toUpperCase();
            const type = (item.type || '').toUpperCase();
            
            // Core Game Categories
            const isGameCategory = cat.includes('GAMES') || cat.includes('GAME') || 
                                  ['CHINA TOPUP', 'PHILIPPINES TOPUP'].includes(cat);
            
            // Gaming/Entertainment Vouchers in "Voucher" category
            const telcoBrands = ['TRI', 'SMARTFREN', 'AXIS', 'INDOSAT', 'TELKOMSEL', 'XL', 'THREE'];
            const laundryShoppingBrands = ['ALFAMART', 'INDOMARET', 'GRAB', 'GOJEK', 'TOKOPEDIA', 'SHOPEE', 'TRAVELOKA'];
            
            const isEntertainmentVoucher = cat === 'VOUCHER' && 
                                           !telcoBrands.some(b => brand.includes(b)) &&
                                           !laundryShoppingBrands.some(b => brand.includes(b));

            return isGameCategory || isEntertainmentVoucher || type === 'Games';
        });

        console.log('Total Games found (broadened):', gameItems.length);

        // Ensure Supplier
        const supplier = await prisma.supplier.upsert({
            where: { code: 'DIGIFLAZZ' },
            update: {
                apiUrl: url,
                apiKey: key,
            },
            create: { 
                name: 'Digiflazz', 
                code: 'DIGIFLAZZ', 
                status: 'ACTIVE', 
                apiUrl: url, 
                apiKey: key, 
                apiSecret: 'SECRET' 
            }
        });

        // 1. Fetch Pricing Rules
        const allRules = await prisma.tierPricingRule.findMany({ where: { isActive: true } });
        const globalRule = allRules.find(r => !r.categoryId);

        let updatedCount = 0;
        let newCount = 0;
        let skippedCount = 0;
        const processedSkuCodes = new Set<string>();

        // Group by Category and Brand to avoid collisions
        for (const item of gameItems) {
            try {
                // Normalize Category: Use the BRAND as the Category per user request
                const brand = item.brand || 'UMUM';
                const brandUpper = brand.toUpperCase();
                const catSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                
                // Real Working CDN URLs for Game Icons
                const gameThumbnails: Record<string, string> = {
                    'MOBILE LEGENDS': 'https://cdn1.codashop.com/S/content/common/images/mno/MobileLegends600x600.png',
                    'FREE FIRE': 'https://cdn1.codashop.com/S/content/common/images/mno/FreeFire600x600.png',
                    'FREE FIRE MAX': 'https://cdn1.codashop.com/S/content/common/images/mno/FreeFire600x600.png',
                    'GENSHIN IMPACT': 'https://cdn1.codashop.com/S/content/common/images/mno/GenshinImpact600x600.png',
                    'PUBG MOBILE': 'https://cdn1.codashop.com/S/content/common/images/mno/PUBGM600x600.png',
                    'VALORANT': 'https://cdn1.codashop.com/S/content/common/images/mno/Valorant600x600.png',
                    'ARENA OF VALOR': 'https://cdn1.codashop.com/S/content/common/images/mno/Aov600x600.png',
                    'HONKAI STAR RAIL': 'https://cdn1.codashop.com/S/content/common/images/mno/HonkaiStarRail600x600.png',
                    'HONOR OF KINGS': 'https://cdn1.codashop.com/S/content/common/images/mno/HOK600x600.png',
                    'POINT BLANK': 'https://cdn1.codashop.com/S/content/common/images/mno/PointBlank600x600.png',
                    'COD MOBILE': 'https://cdn1.codashop.com/S/content/common/images/mno/Codm600x600.png',
                    'CALL OF DUTY MOBILE': 'https://cdn1.codashop.com/S/content/common/images/mno/Codm600x600.png',
                    'GOOGLE PLAY INDONESIA': 'https://cdn1.codashop.com/S/content/common/images/mno/GooglePlay600x600.png',
                    'STEAM WALLET (IDR)': 'https://cdn1.codashop.com/S/content/common/images/mno/Steam600x600.png',
                    'UNIPIN VOUCHER': 'https://cdn1.codashop.com/S/content/common/images/mno/Unipin600x600.png',
                    'GARENA': 'https://cdn1.codashop.com/S/content/common/images/mno/Garena600x600.png',
                    'RAZER GOLD': 'https://cdn1.codashop.com/S/content/common/images/mno/RazerGold600x600.png',
                    'SAUSAGE MAN': 'https://cdn1.codashop.com/S/content/common/images/mno/SausageMan600x600.png',
                    'STUMBLE GUYS': 'https://cdn1.codashop.com/S/content/common/images/mno/StumbleGuys600x600.png',
                    'VIDIO': 'https://cdn1.codashop.com/S/content/common/images/mno/Vidio600x600_2.png',
                    'SPOTIFY': 'https://cdn1.codashop.com/S/content/common/images/mno/Spotify600x600_premium.png'
                };
                const thumbnail = gameThumbnails[brandUpper] || `https://www.google.com/s2/favicons?sz=128&domain=${catSlug}.com`;

                // Ensure Category per Game
                const category = await prisma.category.upsert({
                    where: { slug: catSlug },
                    update: { 
                        name: brand, 
                        isActive: true,
                        image: thumbnail,
                        icon: thumbnail
                    },
                    create: { 
                        name: brand, 
                        slug: catSlug, 
                        isActive: true,
                        image: thumbnail,
                        icon: thumbnail,
                        digiflazzCategory: item.category
                    }
                });

                // Ensure Product (e.g. MOBILE LEGENDS TOPUP)
                const productSlug = `${catSlug}-topup`;
                
                const product = await prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {
                        name: `${brand} Topup`,
                        categoryId: category.id,
                        digiflazzBrand: brand,
                        digiflazzCategory: (item.category || ''),
                        status: 'ACTIVE',
                        thumbnail: thumbnail
                    },
                    create: { 
                        name: `${brand} Topup`, 
                        slug: productSlug, 
                        categoryId: category.id, 
                        status: 'ACTIVE',
                        digiflazzBrand: brand,
                        digiflazzCategory: (item.category || ''),
                        thumbnail: thumbnail
                    }
                });

                // Normalize SKU name: Remove brand name from the name for a cleaner look
                let skuName = item.product_name || '';
                if (skuName.toUpperCase().startsWith(brandUpper)) {
                    skuName = skuName.substring(brand.length).trim();
                    // Remove leading symbols like "-", ":", etc.
                    skuName = skuName.replace(/^[:\-\s]+/, '');
                }

                const basePrice = Number(item.price);
                const rule = allRules.find(r => r.categoryId === category.id) || globalRule;
                
                const mNormal = rule?.marginNormal ?? 10;
                const mPro = rule?.marginPro ?? 8;
                const mLegend = rule?.marginLegend ?? 5;
                const mSupreme = rule?.marginSupreme ?? 3;

                const priceNormal = Math.ceil(basePrice * (1 + mNormal / 100));
                const pricePro    = Math.ceil(basePrice * (1 + mPro / 100));
                const priceLegend = Math.ceil(basePrice * (1 + mLegend / 100));
                const priceSupreme = Math.ceil(basePrice * (1 + mSupreme / 100));

                const skuRecord = await prisma.productSku.findFirst({
                    where: { supplierCode: item.buyer_sku_code, supplierId: supplier.id }
                });

                const isAvailable = item.buyer_product_status && item.seller_product_status;

                if (skuRecord) {
                    await prisma.productSku.update({
                        where: { id: skuRecord.id },
                        data: {
                            name: skuName, // Updated name
                            basePrice,
                            priceNormal,
                            pricePro,
                            priceLegend,
                            priceSupreme,
                            marginNormal: mNormal,
                            marginPro: mPro,
                            marginLegend: mLegend,
                            marginSupreme: mSupreme,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE',
                            productId: product.id
                        }
                    });
                    updatedCount++;
                } else {
                    await prisma.productSku.create({
                        data: {
                            productId: product.id,
                            supplierId: supplier.id,
                            name: skuName, // Clean name
                            supplierCode: item.buyer_sku_code,
                            basePrice,
                            priceNormal,
                            pricePro,
                            priceLegend,
                            priceSupreme,
                            marginNormal: mNormal,
                            marginPro: mPro,
                            marginLegend: mLegend,
                            marginSupreme: mSupreme,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    newCount++;
                }
                
                // If brand has a thumbnail, update the product
                if (thumbnail) {
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { thumbnail: thumbnail }
                    });
                }
                processedSkuCodes.add(item.buyer_sku_code);
            } catch (itemErr) {
                console.error(`Error syncing item ${item.buyer_sku_code}:`, itemErr);
                skippedCount++;
            }
        }

        // 2. CLEANUP non-game products
        console.log('Cleanup: Removing or deactivating non-game SKUs...');
        const allSkus = await prisma.productSku.findMany({
            where: {
                supplierId: supplier.id,
                supplierCode: { notIn: Array.from(processedSkuCodes) }
            },
            include: { _count: { select: { orders: true } } }
        });

        let deletedSkus = 0;
        let deactivatedSkus = 0;

        for (const sku of allSkus) {
            if (sku._count.orders > 0) {
                // Cannot delete due to Order history, just deactivate
                await prisma.productSku.update({
                    where: { id: sku.id },
                    data: { status: 'INACTIVE' }
                });
                deactivatedSkus++;
            } else {
                // Safe to delete dependencies and then SKU
                await prisma.tierPriceHistory.deleteMany({ where: { productSkuId: sku.id } });
                await prisma.merchantProductPrice.deleteMany({ where: { productSkuId: sku.id } });
                
                await prisma.productSku.delete({
                    where: { id: sku.id }
                });
                deletedSkus++;
            }
        }

        // Delete products that have no SKUs at all
        const productsWithNoSkus = await prisma.product.findMany({
            where: { skus: { none: {} } }
        });
        await prisma.product.deleteMany({
            where: { id: { in: productsWithNoSkus.map(p => p.id) } }
        });

        // Delete categories that have no products at all
        const emptyCategories = await prisma.category.findMany({
            where: { products: { none: {} } }
        });
        await prisma.category.deleteMany({
            where: { id: { in: emptyCategories.map(c => c.id) } }
        });

        console.log(`Sync Complete!`);
        console.log(`- Active Game SKUs: ${gameItems.length}`);
        console.log(`- Deleted SKUs (No Orders): ${deletedSkus}`);
        console.log(`- Deactivated SKUs (Has Orders): ${deactivatedSkus}`);
        console.log(`- Deleted Products: ${productsWithNoSkus.length}`);
        console.log(`- Deleted Categories: ${emptyCategories.length}`);
        console.log(`- Skipped/Error: ${skippedCount}`);
    } catch (err: any) {
        console.error('Fatal Sync Error:', err);
    }
}

syncAllDigiflazzProducts().finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
