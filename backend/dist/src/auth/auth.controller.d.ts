import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    superAdminLogin(body: any, req: any): Promise<{
        statusCode: number;
        message: string;
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
            adminPermissions: any;
            plan: import("@prisma/client").$Enums.MerchantPlan;
            merchantSlug: string | undefined;
        };
    }>;
    merchantLogin(body: any, req: any): Promise<{
        statusCode: number;
        message: string;
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
            adminPermissions: any;
            plan: import("@prisma/client").$Enums.MerchantPlan;
            merchantSlug: string | undefined;
        };
    }>;
    publicLogin(body: any, req: any): Promise<{
        statusCode: number;
        message: string;
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
            adminPermissions: any;
            plan: import("@prisma/client").$Enums.MerchantPlan;
            merchantSlug: string | undefined;
        };
    }>;
    logout(req: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    verifyEmail(body: {
        token: string;
        code: string;
    }): Promise<{
        statusCode: number;
        message: string;
    }>;
    changePassword(req: any, body: any): Promise<{
        statusCode: number;
        message: string;
    }>;
}
