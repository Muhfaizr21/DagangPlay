import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    getPending(search?: string): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
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
        status: import("@prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderId: string;
        type: string;
        amount: number;
        settledAt: Date | null;
    })[]>;
    settle(id: string): Promise<any>;
    bulkSettle(): Promise<{
        message: string;
    }>;
}
