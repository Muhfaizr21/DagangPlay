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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
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
        reason: string;
        expiresAt: Date | null;
        blockedBy: string;
    }[]>;
    addBlacklist(data: {
        ipAddress: string;
        reason: string;
    }): Promise<{
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
    getLoginAttempts(limit?: string): Promise<({
        user: {
            name: string;
            email: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        ipAddress: string;
        userAgent: string | null;
        userId: string | null;
        failReason: string | null;
        isSuccess: boolean;
        email: string | null;
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
        action: string;
        entity: string;
        entityId: string | null;
        oldData: import("@prisma/client/runtime/client").JsonValue | null;
        newData: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string | null;
        merchantId: string | null;
    })[]>;
}
