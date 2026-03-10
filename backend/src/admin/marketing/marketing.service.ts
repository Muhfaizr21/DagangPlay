import { Injectable, NotFoundException } from '@nestjs/common';
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
    async getGuidesForMerchant(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) return [];

        // Rules: Supreme can see everything. Legend can see Legend/Pro/Free. Pro can see Pro/Free. Free can see Free.
        // Actually simpler: For now, if the user requested 'Supreme dapat panduan marketing', let's say only Supreme sees it, or we filter by plan.

        // Map hierarchy
        const planWeights = { 'FREE': 0, 'PRO': 1, 'LEGEND': 2, 'SUPREME': 3 };
        const currentWeight = planWeights[merchant.plan] || 0;

        return this.prisma.marketingGuide.findMany({
            where: {
                isActive: true,
                // Only show if guide targetPlan weight <= merchant current weight
                // Since targetPlan is Enum, we filter by plans that are 'at or below' the merchant's level
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
