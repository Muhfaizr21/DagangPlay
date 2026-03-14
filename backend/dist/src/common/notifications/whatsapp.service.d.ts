export declare class WhatsappService {
    private readonly apiKey;
    private readonly apiUrl;
    private readonly adminPhone;
    sendMessage(target: string, message: string): Promise<any>;
    sendOrderNotification(phone: string, orderNumber: string, productName: string, totalPrice: number, paymentUrl: string): Promise<any>;
    sendFulfillmentNotification(phone: string, orderNumber: string, productName: string, status: string, sn: string): Promise<any>;
    sendAdminSummary(content: string): Promise<any>;
}
