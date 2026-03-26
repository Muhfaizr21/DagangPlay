import { PrismaService } from '../../prisma.service';
export declare class MerchantOverridesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllOverrides(): Promise<({
        merchant: {
            name: string;
            slug: string;
        };
        productSku: {
            name: string;
            basePrice: number;
        };
        user: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        productSkuId: string;
        userId: string;
        customPrice: number;
        isActive: boolean;
        reason: string | null;
        expiredAt: Date | null;
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
        productSkuId: string;
        userId: string;
        customPrice: number;
        isActive: boolean;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    })[]>;
    createOverride(dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        productSkuId: string;
        userId: string;
        customPrice: number;
        isActive: boolean;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    }>;
    deleteOverride(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        productSkuId: string;
        userId: string;
        customPrice: number;
        isActive: boolean;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    }>;
}
