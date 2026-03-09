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
        status: import("@prisma/client").$Enums.InvoiceStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    })[]>;
    confirmInvoice(id: string): Promise<any>;
    rejectInvoice(id: string, notes: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
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
        updatedAt: Date;
        description: string | null;
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
        status: import("@prisma/client").$Enums.InvoiceStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        paidAt: Date | null;
        amount: number;
        totalAmount: number;
        tripayReference: string | null;
        tripayPaymentUrl: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        invoiceNo: string;
        tax: number;
        dueDate: Date;
        proofUrl: string | null;
        notes: string | null;
    }>;
}
