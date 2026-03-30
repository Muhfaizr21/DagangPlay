import 'dotenv/config';
import { PrismaService } from '../prisma.service';
export declare class TripayService {
    private prisma;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly privateKey;
    private readonly merchantCode;
    constructor(prisma: PrismaService);
    private getConfigs;
    getPaymentChannels(merchantId?: string): Promise<any>;
    requestTransaction(payload: any, merchantId?: string): Promise<any>;
    verifySignature(callbackSignature: string, payload: string | Buffer, merchantId?: string): Promise<boolean>;
}
