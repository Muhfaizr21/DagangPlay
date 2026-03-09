import { SuppliersService } from './suppliers.service';
import { SupplierStatus } from '@prisma/client';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    getAllSuppliers(): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
        lastSyncAt: Date | null;
    }[]>;
    getSupplierById(id: string): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
        balance: number;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
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
        balance: number;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.SupplierCode;
        apiUrl: string;
        apiKey: string;
        apiSecret: string;
        lastSyncAt: Date | null;
    }>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
        balance: number;
    }>;
    topupBalance(id: string, data: {
        amount: number;
        note?: string;
    }): Promise<any>;
    getLogs(id: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        method: string;
        endpoint: string;
        requestBody: import("@prisma/client/runtime/client").JsonValue | null;
        responseBody: import("@prisma/client/runtime/client").JsonValue | null;
        httpStatus: number | null;
        duration: number | null;
        isSuccess: boolean;
        orderId: string | null;
    }[]>;
    getBalanceHistory(id: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        note: string | null;
        type: string;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[]>;
}
