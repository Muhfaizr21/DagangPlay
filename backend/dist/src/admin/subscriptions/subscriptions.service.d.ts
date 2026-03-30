import { PrismaService } from '../../prisma.service';
import { MerchantPlan } from '@prisma/client';
export declare class SubscriptionsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getInvoices(search?: string, status?: string): Promise<({
        merchant: {
            id: string;
            name: string;
            domain: string | null;
            plan: import("@prisma/client").$Enums.MerchantPlan;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        notes: string | null;
        proofUrl: string | null;
    })[]>;
    confirmInvoice(id: string, operator: string): Promise<any>;
    rejectInvoice(id: string, notes: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        notes: string | null;
        proofUrl: string | null;
    }>;
    updateMerchantPlanManual(merchantId: string, plan: string, durationDays: number, operator: string): Promise<any>;
    getPlanFeatures(): Promise<any>;
    getMerchantPlanFeatures(merchantId: string): Promise<any>;
    checkFeatureLimit(merchantId: string, feature: 'maxProducts' | 'maxMembers' | 'multiUser' | 'whiteLabel' | 'customDomain' | 'flashSale' | 'templateVariants' | 'instantWithdrawal' | 'customProductDetail' | 'buildApk' | 'prioritySupport' | 'resellerAcademy' | 'tldDomain', addingCount?: number): Promise<boolean>;
    updatePlanFeatures(features: any, operator: string): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        key: string;
        value: string;
        type: import("@prisma/client").$Enums.SettingType;
        group: string | null;
        updatedBy: string | null;
    }>;
    getSaaSPerformance(): Promise<{
        totalRevenue: number;
        activeMerchants: number;
        expiredMerchants: number;
        churnRate: string;
    }>;
    handleSaaSCron(): Promise<void>;
    createManualInvoice(merchantId: string, plan: MerchantPlan, amount: number, dueDate: Date, operator: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        notes: string | null;
        proofUrl: string | null;
    }>;
    getTierMappings(): Promise<{
        id: string;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        updatedAt: Date;
        isActive: boolean;
        updatedBy: string;
        tier: import("@prisma/client").$Enums.PriceTier;
    }[]>;
    updateTierMapping(id: string, tier: any, operator: string): Promise<{
        id: string;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        updatedAt: Date;
        isActive: boolean;
        updatedBy: string;
        tier: import("@prisma/client").$Enums.PriceTier;
    }>;
}
