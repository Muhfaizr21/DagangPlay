import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getInvoices(search?: string, status?: string): Promise<({
        merchant: {
            id: string;
            name: string;
            domain: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        totalAmount: number;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    })[]>;
    confirmInvoice(id: string): Promise<any>;
    rejectInvoice(id: string, notes: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        totalAmount: number;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    }>;
    adjustMerchant(id: string, plan: string, days: number): Promise<any>;
    getFeatures(): Promise<any>;
    updateFeatures(features: any): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.SettingType;
        value: string;
        key: string;
        group: string | null;
        updatedBy: string | null;
    }>;
    getPerformance(): Promise<{
        totalRevenue: number;
        activeMerchants: number;
        expiredMerchants: number;
        churnRate: string;
    }>;
    createManualInvoice(merchantId: string, plan: any, amount: number, dueDate: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        merchantId: string;
        paidAt: Date | null;
        amount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        totalAmount: number;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    }>;
}
