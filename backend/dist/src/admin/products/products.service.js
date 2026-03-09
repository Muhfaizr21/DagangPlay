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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const crypto = __importStar(require("crypto"));
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }
    async getProducts() {
        return this.prisma.product.findMany({
            include: {
                category: true,
                skus: {
                    orderBy: { basePrice: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async syncDigiflazzProducts() {
        try {
            const username = process.env.DIGIFLAZZ_USERNAME;
            const key = process.env.DIGIFLAZZ_KEY;
            const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';
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
            if (!response.ok || !jsonResp.data) {
                throw new Error(`Digiflazz Error: ${JSON.stringify(jsonResp)}`);
            }
            const items = jsonResp.data;
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE' }
            });
            let updatedCount = 0;
            let newCount = 0;
            for (const item of items) {
                if (item.category !== 'Games')
                    continue;
                const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: item.brand, slug: brandSlug, isActive: true }
                });
                const productSlug = `${brandSlug}-diamonds`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE' }
                });
                const basePrice = item.price;
                const sellingPrice = Math.ceil(basePrice * 1.10);
                const skuRecord = await this.prisma.productSku.findFirst({
                    where: { supplierCode: item.buyer_sku_code }
                });
                const isAvailable = item.buyer_product_status && item.seller_product_status;
                if (skuRecord) {
                    await this.prisma.productSku.update({
                        where: { id: skuRecord.id },
                        data: {
                            basePrice,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    updatedCount++;
                }
                else {
                    await this.prisma.productSku.create({
                        data: {
                            productId: product.id,
                            supplierId: supplier.id,
                            name: item.product_name,
                            supplierCode: item.buyer_sku_code,
                            basePrice,
                            sellingPrice,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    newCount++;
                }
            }
            await this.prisma.auditLog.create({
                data: {
                    action: 'DIGIFLAZZ_MANUAL_SYNC',
                    entity: 'Product',
                    newData: { newCount, updatedCount, totalItemsParsed: items.length },
                    oldData: {}
                }
            });
            return {
                success: true,
                message: 'Sync Berhasil',
                newCount,
                updatedCount,
            };
        }
        catch (err) {
            console.error(err);
            throw new common_1.InternalServerErrorException(err.message || 'Gagal sinkronisasi produk');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map