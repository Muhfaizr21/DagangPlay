"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
const crypto = __importStar(require("crypto"));
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
        const supplier = await prisma.supplier.upsert({
            where: { code: 'DIGIFLAZZ' },
            update: {},
            create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: url, apiKey: key, apiSecret: 'SECRET' }
        });
        const allRules = await prisma.tierPricingRule.findMany({ where: { isActive: true } });
        const globalRule = allRules.find(r => !r.categoryId);
        let updatedCount = 0;
        let newCount = 0;
        for (const item of items) {
            const isGame = item.category?.toLowerCase().includes('game') ||
                item.category === 'Games' ||
                item.type === 'Games' ||
                item.brand?.toLowerCase().includes('mobile legends') ||
                item.brand?.toLowerCase().includes('free fire');
            if (!isGame)
                continue;
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
            const rule = allRules.find(r => r.categoryId === category.id) || globalRule;
            const basePrice = Number(item.price);
            const mNormal = rule?.marginNormal ?? 10;
            const mPro = rule?.marginPro ?? 8;
            const mLegend = rule?.marginLegend ?? 5;
            const mSupreme = rule?.marginSupreme ?? 3;
            const priceNormal = Math.ceil(basePrice * (1 + mNormal / 100));
            const pricePro = Math.ceil(basePrice * (1 + mPro / 100));
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
                updatedCount++;
            }
            else {
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
                        marginNormal: mNormal,
                        marginPro: mPro,
                        marginLegend: mLegend,
                        marginSupreme: mSupreme,
                        status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                    }
                });
                newCount++;
            }
        }
        console.log(`Sync Success: ${newCount} new, ${updatedCount} updated.`);
    }
    catch (err) {
        console.error('Sync Error:', err);
    }
}
syncDigiflazzProducts().finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=manual_sync.js.map