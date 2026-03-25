import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    adminLogin(body: any, req: any): Promise<{
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
}
