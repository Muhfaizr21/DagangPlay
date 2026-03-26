"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let PromosService = class PromosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPromos(merchantId) {
        return this.prisma.promoCode.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createPromo(merchantId, data) {
        return this.prisma.promoCode.create({
            data: {
                merchantId,
                code: data.code,
                name: data.name || data.code,
                type: data.type || 'DISCOUNT_FLAT',
                value: data.discountAmount || 0,
                appliesTo: data.target === 'ALL' ? 'ALL' : 'CATEGORY',
                forRole: data.forRole || 'ALL',
                quota: data.quota,
                usedCount: 0,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isActive: true
            }
        });
    }
    async togglePromo(merchantId, id, isActive) {
        const promo = await this.prisma.promoCode.findFirst({ where: { id, merchantId } });
        if (!promo)
            throw new common_1.NotFoundException('Promo not found');
        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive }
        });
    }
    async deletePromo(merchantId, id) {
        const promo = await this.prisma.promoCode.findFirst({ where: { id, merchantId } });
        if (!promo)
            throw new common_1.NotFoundException('Promo not found');
        return this.prisma.promoCode.delete({ where: { id } });
    }
    async getFlashSales(merchantId) {
        return this.prisma.flashSaleEvent.findMany({
            where: { merchantId },
            include: {
                items: {
                    include: {
                        productSku: {
                            select: { name: true, priceNormal: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createFlashSale(merchantId, data) {
        return this.prisma.flashSaleEvent.create({
            data: {
                merchantId,
                name: data.name,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                isActive: data.isActive !== undefined ? data.isActive : true,
                discountType: data.discountType || 'PERCENTAGE',
                discountValue: Number(data.discountValue || 0),
                items: {
                    create: (data.items || []).map((item) => ({
                        productSkuId: item.productSkuId,
                        originalPrice: Number(item.originalPrice),
                        salePrice: Number(item.salePrice),
                        stockLimit: item.stockLimit ? Number(item.stockLimit) : null
                    }))
                }
            }
        });
    }
    async toggleFlashSale(merchantId, id, isActive) {
        const flashSale = await this.prisma.flashSaleEvent.findFirst({ where: { id, merchantId } });
        if (!flashSale)
            throw new common_1.NotFoundException('Flash Sale not found');
        return this.prisma.flashSaleEvent.update({
            where: { id },
            data: { isActive }
        });
    }
    async deleteFlashSale(merchantId, id) {
        const flashSale = await this.prisma.flashSaleEvent.findFirst({ where: { id, merchantId } });
        if (!flashSale)
            throw new common_1.NotFoundException('Flash Sale not found');
        return this.prisma.flashSaleEvent.delete({ where: { id } });
    }
};
exports.PromosService = PromosService;
exports.PromosService = PromosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromosService);
//# sourceMappingURL=promos.service.js.map