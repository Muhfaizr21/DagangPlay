import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    getPending(search?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        order: {
            id: string;
            orderNumber: string;
            productName: string;
            totalPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CommissionStatus;
        userId: string;
        amount: number;
        orderId: string;
        type: string;
        settledAt: Date | null;
    })[]>;
    settle(id: string): Promise<any>;
    bulkSettle(): Promise<{
        message: string;
    }>;
}
