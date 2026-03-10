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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
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
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    })[]>;
    createOverride(dto: any, req: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
    deleteOverride(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
}
