import { PrismaService } from '../../prisma.service';
import { SupplierStatus } from '@prisma/client';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllSuppliers(): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
        balance: number;
        lastSyncAt: Date | null;
    }[]>;
    getSupplierById(id: string): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
        balance: number;
        lastSyncAt: Date | null;
    }>;
    updateSupplier(id: string, data: {
        name?: string;
        apiUrl?: string;
        apiKey?: string;
        apiSecret?: string;
        status?: SupplierStatus;
    }): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
        balance: number;
        lastSyncAt: Date | null;
    }>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
        balance: number;
    }>;
    topupBalance(id: string, amount: number, note?: string): Promise<any>;
    getSupplierLogs(id: string, limit?: number): Promise<{
        method: string;
        id: string;
        supplierId: string;
        createdAt: Date;
        endpoint: string;
        requestBody: import("@prisma/client/runtime/client").JsonValue | null;
        responseBody: import("@prisma/client/runtime/client").JsonValue | null;
        httpStatus: number | null;
        duration: number | null;
        isSuccess: boolean;
        orderId: string | null;
    }[]>;
    getSupplierBalanceHistories(id: string, limit?: number): Promise<{
        id: string;
        supplierId: string;
        createdAt: Date;
        note: string | null;
        type: string;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[]>;
}
