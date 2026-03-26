import { SecurityService } from './security.service';
export declare class SecurityController {
    private readonly securityService;
    constructor(securityService: SecurityService);
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
        userId: string;
        reason: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
    })[]>;
    resolveFraud(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        reason: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        orderId: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
        riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
        isResolved: boolean;
    }>;
    getBlacklist(): Promise<{
        id: string;
        createdAt: Date;
        reason: string;
        ipAddress: string;
        expiresAt: Date | null;
        blockedBy: string;
    }[]>;
    addBlacklist(data: {
        ipAddress: string;
        reason: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        reason: string;
        ipAddress: string;
        expiresAt: Date | null;
        blockedBy: string;
    }>;
    removeBlacklist(id: string): Promise<{
        id: string;
        createdAt: Date;
        reason: string;
        ipAddress: string;
        expiresAt: Date | null;
        blockedBy: string;
    }>;
    getLoginAttempts(limit?: string): Promise<({
        user: {
            name: string;
            email: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        email: string | null;
        failReason: string | null;
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
