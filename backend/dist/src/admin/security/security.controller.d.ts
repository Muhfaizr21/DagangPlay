import { SecurityService } from './security.service';
export declare class SecurityController {
    private readonly securityService;
    constructor(securityService: SecurityService);
    getFraudDetections(riskLevel?: string): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
        };
        order: {
            id: string;
            orderNumber: string;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        userId: string;
        reason: string;
        orderId: string | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    })[]>;
    resolveFraud(id: string): Promise<{
        id: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        userId: string;
        reason: string;
        orderId: string | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    getBlacklist(): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string | null;
        expiresAt: Date | null;
        blockedBy: string | null;
    }[]>;
    addBlacklist(data: {
        ipAddress: string;
        reason: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string | null;
        expiresAt: Date | null;
        blockedBy: string | null;
    }>;
    removeBlacklist(id: string): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string;
        reason: string | null;
        expiresAt: Date | null;
        blockedBy: string | null;
    }>;
    getLoginAttempts(limit?: string): Promise<({
        user: {
            email: string | null;
            name: string;
        } | null;
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        failReason: string | null;
        userId: string | null;
        ipAddress: string;
        userAgent: string | null;
        isSuccess: boolean;
    })[]>;
    getAuditLogs(startDate?: string, action?: string): Promise<({
        user: {
            email: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        merchantId: string | null;
        createdAt: Date;
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
