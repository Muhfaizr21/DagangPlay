import { PrismaService } from '../../prisma.service';
export declare class SecurityService {
    private prisma;
    constructor(prisma: PrismaService);
    getFraudDetections(riskLevel?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
        };
        order: {
            id: string;
            orderNumber: string;
            totalPrice: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
        reason: string;
        orderId: string | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    })[]>;
    resolveFraud(id: string, resolvedBy: string): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
        reason: string;
        orderId: string | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    getBlacklistedIps(): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string;
        expiresAt: Date | null;
        blockedBy: string;
    }[]>;
    blacklistIp(ipAddress: string, reason: string, blockedBy: string): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string;
        expiresAt: Date | null;
        blockedBy: string;
    }>;
    removeBlacklist(id: string): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string;
        expiresAt: Date | null;
        blockedBy: string;
    }>;
    getLoginAttempts(limit?: number): Promise<({
        user: {
            name: string;
            email: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        failReason: string | null;
        userId: string | null;
        ipAddress: string;
        userAgent: string | null;
        isSuccess: boolean;
    })[]>;
    getAuditLogs(startDate?: string, action?: string): Promise<({
        user: {
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
    })[]>;
}
