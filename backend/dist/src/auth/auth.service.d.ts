import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    adminLogin(data: any): Promise<{
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
        };
    }>;
}
