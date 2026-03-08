import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PromoType, PromoAppliesTo, PromoForRole } from '@prisma/client';

@Injectable()
export class PromosService {
    constructor(private prisma: PrismaService) { }

    async getAllPromos(search?: string) {
        const where: any = {};
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

    async getPromoById(id: string) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Promo not found');
        return promo;
    }

    async createPromo(data: any) {
        // In real app, we would validate Date strings properly
        const newPromo = await this.prisma.promoCode.create({
            data: {
                code: data.code.toUpperCase(),
                name: data.name,
                description: data.description,
                type: data.type as PromoType,
                value: Number(data.value),
                maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
                minPurchase: data.minPurchase ? Number(data.minPurchase) : null,
                quota: data.quota ? Number(data.quota) : null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive ?? true,
                appliesTo: data.appliesTo as PromoAppliesTo || 'ALL',
                categoryId: data.categoryId || null,
                forRole: data.forRole as PromoForRole || 'ALL',
                merchantId: data.merchantId || null,
            }
        });

        return newPromo;
    }

    async updatePromo(id: string, data: any) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Promo not found');

        const updateData: any = { ...data };

        // Convert data types
        if (updateData.value !== undefined) updateData.value = Number(updateData.value);
        if (updateData.maxDiscount !== undefined) updateData.maxDiscount = updateData.maxDiscount ? Number(updateData.maxDiscount) : null;
        if (updateData.minPurchase !== undefined) updateData.minPurchase = updateData.minPurchase ? Number(updateData.minPurchase) : null;
        if (updateData.quota !== undefined) updateData.quota = updateData.quota ? Number(updateData.quota) : null;
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        const updated = await this.prisma.promoCode.update({
            where: { id },
            data: updateData
        });

        return updated;
    }

    async togglePromoStatus(id: string) {
        const promo = await this.prisma.promoCode.findUnique({ where: { id } });
        if (!promo) throw new NotFoundException('Promo not found');

        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive: !promo.isActive }
        });
    }

    async deletePromo(id: string) {
        // We can't hard delete if it has been used in orders. Best to soft delete or just throw error if usages exist
        const usages = await this.prisma.promoUsage.count({ where: { promoCodeId: id } });
        if (usages > 0) {
            // Just set inactive instead of throwing
            return this.prisma.promoCode.update({ where: { id }, data: { isActive: false } });
        }

        return this.prisma.promoCode.delete({ where: { id } });
    }

    async getPromoReport() {
        // Basic aggregation for dashboard
        const totals = await this.prisma.promoCode.aggregate({
            _sum: { usedCount: true }
        });

        const usages = await this.prisma.promoUsage.aggregate({
            _sum: { discountAmount: true }
        });

        // Top promos
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
}
