import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantPlan } from '@prisma/client';

@Injectable()
export class MarketingService {
    constructor(private prisma: PrismaService) { }

    async getAllGuides(search?: string, plan?: MerchantPlan) {
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

    async getGuideById(id: string) {
        const guide = await this.prisma.marketingGuide.findUnique({ where: { id } });
        if (!guide) throw new NotFoundException('Panduan tidak ditemukan');
        return guide;
    }

    async createGuide(data: any) {
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

    async updateGuide(id: string, data: any) {
        return this.prisma.marketingGuide.update({
            where: { id },
            data: {
                ...data,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : undefined
            }
        });
    }

    async deleteGuide(id: string) {
        return this.prisma.marketingGuide.delete({ where: { id } });
    }

    // Merchant side: Get guides based on their plan
    // 🔒 SECURITY: Cek plan feature 'resellerAcademy' dari SystemSetting di DB
    async getGuidesForMerchant(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) return [];

        const planWeights: Record<string, number> = { 'FREE': 0, 'PRO': 1, 'LEGEND': 2, 'SUPREME': 3 };
        const currentWeight = planWeights[merchant.plan as string] || 0;

        // Cek plan feature 'resellerAcademy' dari SystemSetting (DB — bisa diubah admin)
        const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'saas_plan_features' } });
        if (setting) {
            const planFeatures = JSON.parse(setting.value);
            const merchantPlanFeatures = planFeatures[merchant.plan as string] || planFeatures['FREE'] || {};

            if (!merchantPlanFeatures.resellerAcademy) {
                throw new ForbiddenException(
                    `Fitur Reseller Academy tidak tersedia di paket ${merchant.plan}. Silakan upgrade ke SUPREME.`
                );
            }
        } else {
            // Fallback jika DB setting tidak ada: hanya SUPREME
            if (currentWeight < 3) {
                throw new ForbiddenException(
                    `Fitur Reseller Academy hanya tersedia untuk paket SUPREME. Silakan upgrade.`
                );
            }
        }

        // Merchant eligible — return guides sesuai plan hierarchy
        return this.prisma.marketingGuide.findMany({
            where: {
                isActive: true,
                OR: [
                    { targetPlan: 'FREE' },
                    ...(currentWeight >= 1 ? [{ targetPlan: 'PRO' as MerchantPlan }] : []),
                    ...(currentWeight >= 2 ? [{ targetPlan: 'LEGEND' as MerchantPlan }] : []),
                    ...(currentWeight >= 3 ? [{ targetPlan: 'SUPREME' as MerchantPlan }] : []),
                ]
            },
            orderBy: { sortOrder: 'asc' }
        });
    }
}
