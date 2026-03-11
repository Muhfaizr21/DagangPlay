import { PrismaService } from '../../prisma.service';
export declare class MerchantOverridesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllOverrides(): Promise<({
        productSku: {
            name: string;
            basePrice: number;
        };
        merchant: {
            name: string;
            slug: string;
        };
        user: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        userId: string;
        merchantId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    })[]>;
    getOverridesByMerchant(merchantId: string): Promise<({
        productSku: {
            id: string;
            productId: string;
            supplierId: string;
            name: string;
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
            status: import("@prisma/client").$Enums.SkuStatus;
            sortOrder: number;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        userId: string;
        merchantId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    })[]>;
    createOverride(dto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        userId: string;
        merchantId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    }>;
    deleteOverride(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        userId: string;
        merchantId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        expiredAt: Date | null;
        customModalPrice: number | null;
    }>;
}
