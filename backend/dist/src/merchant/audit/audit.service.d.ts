import { PrismaService } from '../../prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getLogs(merchantId: string, page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("@prisma/client").$Enums.Role;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            merchantId: string | null;
            userId: string | null;
            action: string;
            entity: string;
            entityId: string | null;
            oldData: import("@prisma/client/runtime/client").JsonValue | null;
            newData: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    logAction(data: {
        userId: string;
        merchantId: string;
        action: string;
        entity: string;
        entityId?: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        merchantId: string | null;
        userId: string | null;
        action: string;
        entity: string;
        entityId: string | null;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
