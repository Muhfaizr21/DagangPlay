import { SaasService } from './saas.service';
export declare class SaasController {
    private readonly saasService;
    constructor(saasService: SaasService);
    getGlobalLedgers(): Promise<{
        totalEscrow: number;
        totalAvailable: number;
        merchants: {
            id: string;
            name: string;
            escrowBalance: number;
            availableBalance: number;
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
    requeueDLQJob(jobId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getDomainsStatus(): Promise<{
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
        autoPayoutThreshold?: number | undefined;
        autoPayoutSchedule?: string | null | undefined;
        escrowBalance?: number | undefined;
        availableBalance?: number | undefined;
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
        autoPayoutEnabled: boolean;
        autoPayoutThreshold: number;
        autoPayoutSchedule: string | null;
        forceHttps: boolean;
        escrowBalance: number;
        availableBalance: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
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
    retryMerchantWebhook(payload: {
        logId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
