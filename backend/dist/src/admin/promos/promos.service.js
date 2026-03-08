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
    async getAllPromos(search) {
        const where = {};
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ];
        }
        return this.prisma.promoCode.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                merchant: { select: { name: true } },
                category: { select: { name: true } }
            }
        });
    }
    async getPromoById(id) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promo not found');
        return promo;
    }
    async createPromo(data) {
        const newPromo = await this.prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(),
                name: data.name,
                description: data.description,
                type: data.type,
                value: Number(data.value),
                maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
                minPurchase: data.minPurchase ? Number(data.minPurchase) : null,
                quota: data.quota ? Number(data.quota) : null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive ?? true,
                appliesTo: data.appliesTo || 'ALL',
                categoryId: data.categoryId || null,
                forRole: data.forRole || 'ALL',
                merchantId: data.merchantId || null,
            }
        });
        return newPromo;
    }
    async updatePromo(id, data) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promo not found');
        const updateData = { ...data };
        if (updateData.value !== undefined)
            updateData.value = Number(updateData.value);
        if (updateData.maxDiscount !== undefined)
            updateData.maxDiscount = updateData.maxDiscount ? Number(updateData.maxDiscount) : null;
        if (updateData.minPurchase !== undefined)
            updateData.minPurchase = updateData.minPurchase ? Number(updateData.minPurchase) : null;
        if (updateData.quota !== undefined)
            updateData.quota = updateData.quota ? Number(updateData.quota) : null;
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        const updated = await this.prisma.promoCode.update({
            where: { id },
            data: updateData
        });
        return updated;
    }
    async togglePromoStatus(id) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promo not found');
        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive: !promo.isActive }
        });
    }
    async deletePromo(id) {
        const usages = await this.prisma.promoUsage.count({ where: { promoCodeId: id } });
        if (usages > 0) {
            return this.prisma.promoCode.update({ where: { id }, data: { isActive: false } });
        }
        return this.prisma.promoCode.delete({ where: { id } });
    }
    async getPromoReport() {
        const totals = await this.prisma.promoCode.aggregate({
            _sum: { usedCount: true }
        });
        const usages = await this.prisma.promoUsage.aggregate({
            _sum: { discountAmount: true }
        });
        const topPromos = await this.prisma.promoCode.findMany({
            orderBy: { usedCount: 'desc' },
            take: 5,
            select: { id: true, code: true, name: true, usedCount: true, type: true }
        });
        return {
            totalTimesUsed: totals._sum.usedCount || 0,
            totalDiscountGiven: Number(usages._sum.discountAmount || 0),
            topPromos
        };
    }
};
exports.PromosService = PromosService;
exports.PromosService = PromosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromosService);
//# sourceMappingURL=promos.service.js.map