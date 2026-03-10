import { PrismaService } from '../../prisma.service';
export declare class MerchantOverridesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllOverrides(): Promise<({
        merchant: {
            name: string;
            slug: string;
        };
        user: {
            name: string;
        };
        productSku: {
            name: string;
            basePrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    })[]>;
    getOverridesByMerchant(merchantId: string): Promise<({
        productSku: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SkuStatus;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            supplierId: string;
            supplierCode: string;
            backupSupplierId: string | null;
            backupSupplierCode: string | null;
            basePrice: number;
            priceNormal: number;
            pricePro: number;
            priceLegend: number;
            priceSupreme: number;
            marginNormal: number;
            marginPro: number;
            marginLegend: number;
            marginSupreme: number;
            stock: number;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    })[]>;
    createOverride(dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
    deleteOverride(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
}
