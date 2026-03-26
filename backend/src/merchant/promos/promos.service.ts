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

    // --- FLASH SALES ---
    async getFlashSales(merchantId: string) {
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

    async createFlashSale(merchantId: string, data: any) {
        // Here data.items would contain { productSkuId, originalPrice, salePrice, stockLimit }
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
                    create: (data.items || []).map((item: any) => ({
                        productSkuId: item.productSkuId,
                        originalPrice: Number(item.originalPrice),
                        salePrice: Number(item.salePrice),
                        stockLimit: item.stockLimit ? Number(item.stockLimit) : null
                    }))
                }
            }
        });
    }

    async toggleFlashSale(merchantId: string, id: string, isActive: boolean) {
        const flashSale = await this.prisma.flashSaleEvent.findFirst({ where: { id, merchantId } });
        if (!flashSale) throw new NotFoundException('Flash Sale not found');

        return this.prisma.flashSaleEvent.update({
            where: { id },
            data: { isActive }
        });
    }

    async deleteFlashSale(merchantId: string, id: string) {
        const flashSale = await this.prisma.flashSaleEvent.findFirst({ where: { id, merchantId } });
        if (!flashSale) throw new NotFoundException('Flash Sale not found');

        return this.prisma.flashSaleEvent.delete({ where: { id } });
    }
}
