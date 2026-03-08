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
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        confirmedBy: string | null;
        invoiceNo: string;
        tax: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    })[]>;
    confirmInvoice(id: string, operator: string): Promise<any>;
    rejectInvoice(id: string, notes: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        confirmedBy: string | null;
        invoiceNo: string;
        tax: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    }>;
    updateMerchantPlanManual(merchantId: string, plan: string, durationDays: number, operator: string): Promise<any>;
    getPlanFeatures(): Promise<any>;
    updatePlanFeatures(features: any, operator: string): Promise<{
        id: string;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.SettingType;
        value: string;
        key: string;
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
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        confirmedBy: string | null;
        invoiceNo: string;
        tax: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    }>;
}
