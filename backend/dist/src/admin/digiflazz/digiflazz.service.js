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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiflazzService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let DigiflazzService = class DigiflazzService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDigiflazzConfig() {
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY;
        const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';
        if (!username || !key) {
            throw new common_1.InternalServerErrorException('Kredensial Digiflazz tidak dikonfigurasi pada environment variables (.env)');
        }
        return { username, key, url };
    }
    priceListCache = null;
    lastFetchTime = 0;
    async getDigiflazzProducts() {
        try {
            const now = Date.now();
            let rawItems = [];
            if (this.priceListCache && (now - this.lastFetchTime) < 60000) {
                console.log('[DigiflazzService] Menggunakan data cache Digiflazz (Menghindari limitasi rate)');
                rawItems = this.priceListCache;
            }
            else {
                const { username, key, url } = this.getDigiflazzConfig();
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
                if (!response.ok || !jsonResp.data) {
                    throw new common_1.InternalServerErrorException(`Digiflazz Error: ${JSON.stringify(jsonResp)}`);
                }
                rawItems = jsonResp.data;
                const cachePath = path.join(process.cwd(), 'digiflazz-cache.json');
                if (!Array.isArray(jsonResp.data)) {
                    console.warn('[DigiflazzService] API Digiflazz Error/Limit.', jsonResp.data);
                    if (fs.existsSync(cachePath)) {
                        console.log('[DigiflazzService] Memuat data Digiflazz dari local disk cache...');
                        rawItems = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    }
                    else {
                        console.warn('[DigiflazzService] Tidak ada local file cache. Menggunakan Data Mock Sementara.');
                        rawItems = [
                            { buyer_sku_code: "ML5", product_name: "5 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 1500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "ML86", product_name: "86 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 24500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "ML172", product_name: "172 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 48000, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "FF70", product_name: "70 Diamonds", category: "Games", brand: "FREE FIRE", type: "Umum", seller_name: "Digiflazz", price: 10000, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "FF140", product_name: "140 Diamonds", category: "Games", brand: "FREE FIRE", type: "Umum", seller_name: "Digiflazz", price: 19500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "PB1200", product_name: "1.200 PB Cash", category: "Games", brand: "POINT BLANK", type: "Umum", seller_name: "Digiflazz", price: 9500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "PUBG60", product_name: "60 UC", category: "Games", brand: "PUBG MOBILE", type: "Umum", seller_name: "Digiflazz", price: 14500, buyer_product_status: true, seller_product_status: true }
                        ];
                    }
                }
                else {
                    this.priceListCache = rawItems;
                    this.lastFetchTime = now;
                    fs.writeFileSync(cachePath, JSON.stringify(rawItems), 'utf8');
                    console.log('[DigiflazzService] Data Digiflazz asli berhasil disimpan ke local disk cache.');
                }
            }
            const localSkus = await this.prisma.productSku.findMany({
                where: { supplier: { code: 'DIGIFLAZZ' } },
                include: { product: { include: { category: true } } }
            });
            const skuMap = new Map();
            for (const sku of localSkus) {
                skuMap.set(sku.supplierCode, sku);
            }
            return rawItems.map((item) => {
                const localSku = skuMap.get(item.buyer_sku_code);
                return {
                    buyer_sku_code: item.buyer_sku_code,
                    product_name: item.product_name,
                    category: item.category,
                    brand: item.brand,
                    type: item.type,
                    seller_name: item.seller_name,
                    price: item.price,
                    buyer_product_status: item.buyer_product_status,
                    seller_product_status: item.seller_product_status,
                    is_mapped: !!localSku,
                    local_info: localSku ? {
                        id: localSku.id,
                        productId: localSku.productId,
                        productName: localSku.product.name,
                        categoryId: localSku.product.categoryId,
                        categoryName: localSku.product.category?.name,
                        sellingPrice: localSku.sellingPrice,
                        status: localSku.status,
                    } : null
                };
            });
        }
        catch (err) {
            console.error('[DigiflazzService] Error fetching price list:', err);
            throw new common_1.InternalServerErrorException(err.message || 'Gagal mengambil data dari Digiflazz');
        }
    }
    async syncProduct(dto) {
        try {
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE' }
            });
            let categoryId = dto.categoryId;
            const brandSlug = dto.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!categoryId) {
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: dto.brand, slug: brandSlug, isActive: true }
                });
                categoryId = category.id;
            }
            let productId = dto.productId;
            if (!productId) {
                const productSlug = `${brandSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${dto.brand} Topup`, slug: productSlug, categoryId: categoryId, status: 'ACTIVE' }
                });
                productId = product.id;
            }
            const existingSku = await this.prisma.productSku.findFirst({
                where: { supplierCode: dto.buyer_sku_code, supplierId: supplier.id }
            });
            let savedSku;
            if (existingSku) {
                savedSku = await this.prisma.productSku.update({
                    where: { id: existingSku.id },
                    data: {
                        productId: productId,
                        name: dto.product_name,
                        basePrice: dto.digiflazz_price,
                        sellingPrice: dto.sellingPrice,
                        status: dto.status
                    }
                });
                if (Number(existingSku.sellingPrice) !== Number(dto.sellingPrice) || Number(existingSku.basePrice) !== Number(dto.digiflazz_price)) {
                    await this.prisma.auditLog.create({
                        data: {
                            action: 'DIGIFLAZZ_PRICE_UPDATE',
                            entity: 'ProductSku',
                            newData: { sellingPrice: dto.sellingPrice, basePrice: dto.digiflazz_price },
                            oldData: { sellingPrice: Number(existingSku.sellingPrice), basePrice: Number(existingSku.basePrice) },
                        }
                    });
                }
            }
            else {
                savedSku = await this.prisma.productSku.create({
                    data: {
                        productId: productId,
                        supplierId: supplier.id,
                        name: dto.product_name,
                        supplierCode: dto.buyer_sku_code,
                        basePrice: dto.digiflazz_price,
                        sellingPrice: dto.sellingPrice,
                        status: dto.status
                    }
                });
                await this.prisma.auditLog.create({
                    data: {
                        action: 'DIGIFLAZZ_PRODUCT_MAPPED',
                        entity: 'ProductSku',
                        newData: { skuId: savedSku.id, buyer_sku_code: dto.buyer_sku_code },
                    }
                });
            }
            return { success: true, message: 'Produk berhasil di-sync dan di-mapping', sku: savedSku };
        }
        catch (err) {
            console.error('[DigiflazzService] Error syncing product:', err);
            throw new common_1.InternalServerErrorException('Gagal melakukan sinkronisasi produk (' + err.message + ')');
        }
    }
    async bulkSyncProducts(payload) {
        let successCount = 0;
        for (const p of payload) {
            await this.syncProduct({
                buyer_sku_code: p.buyer_sku_code,
                product_name: p.product_name,
                brand: p.brand,
                category_digiflazz: p.category,
                digiflazz_price: p.price,
                categoryId: p.categoryId,
                productId: p.productId,
                sellingPrice: p.sellingPrice,
                status: p.status
            });
            successCount++;
        }
        return { success: true, message: `${successCount} produk berhasil di-sync secara massal.` };
    }
};
exports.DigiflazzService = DigiflazzService;
exports.DigiflazzService = DigiflazzService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigiflazzService);
//# sourceMappingURL=digiflazz.service.js.map