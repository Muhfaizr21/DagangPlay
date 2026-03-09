import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PromosService {
    constructor(private prisma: PrismaService) { }

    async getPromos(merchantId: string) {
        return this.prisma.promoCode.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createPromo(merchantId: string, data: any) {
        return this.prisma.promoCode.create({
            data: {
                merchantId,
                code: data.code,
                name: data.name || data.code,
                type: data.type || 'DISCOUNT_FLAT',
                value: data.discountAmount || 0,
                appliesTo: data.target === 'ALL' ? 'ALL' : 'CATEGORY', // Simplify for now
                forRole: data.forRole || 'ALL',
                quota: data.quota,
                usedCount: 0,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isActive: true
            }
        });
    }

    async togglePromo(merchantId: string, id: string, isActive: boolean) {
        const promo = await this.prisma.promoCode.findFirst({ where: { id, merchantId } });
        if (!promo) throw new NotFoundException('Promo not found');

        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive }
        });
    }

    async deletePromo(merchantId: string, id: string) {
        const promo = await this.prisma.promoCode.findFirst({ where: { id, merchantId } });
        if (!promo) throw new NotFoundException('Promo not found');

        return this.prisma.promoCode.delete({ where: { id } });
    }
}
