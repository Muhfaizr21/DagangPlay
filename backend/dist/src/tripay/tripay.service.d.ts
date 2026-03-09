import 'dotenv/config';
export declare class TripayService {
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly privateKey;
    private readonly merchantCode;
    getPaymentChannels(): Promise<any>;
    requestTransaction(payload: any): Promise<any>;
    verifySignature(callbackSignature: string, jsonPayload: string): boolean;
}
