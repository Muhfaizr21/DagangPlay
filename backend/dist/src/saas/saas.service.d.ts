import { PrismaService } from 'src/prisma.service';
import { Queue } from 'bullmq';
export declare class SaasService {
    private prisma;
    private webhookQueue;
    constructor(prisma: PrismaService, webhookQueue: Queue);
    handleDailySettlement(): Promise<void>;
    getGlobalLedgers(): Promise<{
        totalEscrow: number;
        totalAvailable: number;
        merchants: {
            id: string;
            name: string;
            availableBalance: number;
            escrowBalance: number;
        }[];
    }>;
    getDeadLetterQueue(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isResolved: boolean;
        attemptCount: number;
        queueName: string;
        jobId: string;
        jobData: import("@prisma/client/runtime/client").JsonValue;
        failedReason: string;
        lastAttemptAt: Date;
    }[]>;
    requeueDLQJob(dlqId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMerchantDomainsStatus(): Promise<{
        id: string;
        name: string;
        domain: string | null;
        forceHttps: boolean;
    }[]>;
    getMerchantLedger(merchantId: string): Promise<{
        movements: {
            id: string;
            description: string;
            createdAt: Date;
            merchantId: string;
            amount: number;
            orderId: string | null;
            type: string;
            escrowBefore: number;
            escrowAfter: number;
            availableBefore: number;
            availableAfter: number;
        }[];
        autoPayoutEnabled?: boolean | undefined;
        autoPayoutSchedule?: string | null | undefined;
        autoPayoutThreshold?: number | undefined;
        availableBalance?: number | undefined;
        escrowBalance?: number | undefined;
    }>;
    updateAutoPayoutConfig(body: any): Promise<{
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        domain: string | null;
        description: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        autoPayoutEnabled: boolean;
        autoPayoutSchedule: string | null;
        autoPayoutThreshold: number;
        availableBalance: number;
        escrowBalance: number;
        forceHttps: boolean;
    }>;
    getMerchantWebhookLogs(merchantId: string): Promise<{
        id: string;
        createdAt: Date;
        merchantId: string;
        responseBody: import("@prisma/client/runtime/client").JsonValue | null;
        isSuccess: boolean;
        event: string;
        endpointUrl: string;
        requestHeaders: import("@prisma/client/runtime/client").JsonValue | null;
        requestPayload: import("@prisma/client/runtime/client").JsonValue;
        responseStatus: number | null;
        responseHeaders: import("@prisma/client/runtime/client").JsonValue | null;
        latencyMs: number | null;
        attemptCount: number;
        errorReason: string | null;
    }[]>;
    retryMerchantWebhook(logId: string, merchantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
