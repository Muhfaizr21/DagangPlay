import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(data: any, allowedRoles: string[], targetName: string): Promise<{
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
    superAdminLogin(data: any): Promise<{
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
    merchantLogin(data: any): Promise<{
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
    publicLogin(data: any): Promise<{
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
    logout(token: string): Promise<void>;
    verifyEmail(token: string, code: string): Promise<{
        statusCode: number;
        message: string;
    }>;
}
