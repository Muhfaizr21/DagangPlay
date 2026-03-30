import { WhatsappService } from 'src/common/notifications/whatsapp.service';
import { PrismaService } from 'src/prisma.service';
export declare class PublicOtpService {
    private whatsapp;
    private prisma;
    private otps;
    constructor(whatsapp: WhatsappService, prisma: PrismaService);
    sendOtp(phone: string, merchantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(phone: string, merchantId: string, code: string): Promise<{
        success: boolean;
        token: string;
    }>;
    isVerified(phone: string, merchantId: string, token: string): boolean;
}
