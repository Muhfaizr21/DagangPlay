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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let MarketingService = class MarketingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllGuides(search, plan) {
        return this.prisma.marketingGuide.findMany({
            where: {
                AND: [
                    search ? { title: { contains: search, mode: 'insensitive' } } : {},
                    plan ? { targetPlan: plan } : {}
                ]
            },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async getGuideById(id) {
        const guide = await this.prisma.marketingGuide.findUnique({ where: { id } });
        if (!guide)
            throw new common_1.NotFoundException('Panduan tidak ditemukan');
        return guide;
    }
    async createGuide(data) {
        return this.prisma.marketingGuide.create({
            data: {
                title: data.title,
                slug: data.slug || data.title.toLowerCase().replace(/ /g, '-'),
                content: data.content,
                videoUrl: data.videoUrl,
                imageUrl: data.imageUrl,
                thumbnail: data.thumbnail,
                category: data.category,
                targetPlan: data.targetPlan || 'SUPREME',
                isActive: data.isActive !== undefined ? data.isActive : true,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0
            }
        });
    }
    async updateGuide(id, data) {
        return this.prisma.marketingGuide.update({
            where: { id },
            data: {
                ...data,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : undefined
            }
        });
    }
    async deleteGuide(id) {
        return this.prisma.marketingGuide.delete({ where: { id } });
    }
    async getGuidesForMerchant(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant)
            return [];
        const planWeights = { 'FREE': 0, 'PRO': 1, 'LEGEND': 2, 'SUPREME': 3 };
        const currentWeight = planWeights[merchant.plan] || 0;
        const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'saas_plan_features' } });
        if (setting) {
            const planFeatures = JSON.parse(setting.value);
            const merchantPlanFeatures = planFeatures[merchant.plan] || planFeatures['FREE'] || {};
            if (!merchantPlanFeatures.resellerAcademy) {
                throw new common_1.ForbiddenException(`Fitur Reseller Academy tidak tersedia di paket ${merchant.plan}. Silakan upgrade ke SUPREME.`);
            }
        }
        else {
            if (currentWeight < 3) {
                throw new common_1.ForbiddenException(`Fitur Reseller Academy hanya tersedia untuk paket SUPREME. Silakan upgrade.`);
            }
        }
        return this.prisma.marketingGuide.findMany({
            where: {
                isActive: true,
                OR: [
                    { targetPlan: 'FREE' },
                    ...(currentWeight >= 1 ? [{ targetPlan: 'PRO' }] : []),
                    ...(currentWeight >= 2 ? [{ targetPlan: 'LEGEND' }] : []),
                    ...(currentWeight >= 3 ? [{ targetPlan: 'SUPREME' }] : []),
                ]
            },
            orderBy: { sortOrder: 'asc' }
        });
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map