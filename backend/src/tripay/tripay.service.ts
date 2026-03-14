import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
    private readonly logger = new Logger(TripayService.name);
    // Base URL Documentation (Sandbox and Production have different hostnames)
    // Sandbox: https://payment.tripay.co.id/api-sandbox/...
    // Production: https://payment.tripay.co.id/api/...
    private readonly baseUrl = (process.env.TRIPAY_URL || 'https://tripay.co.id/api-sandbox').trim().replace(/\/$/, '');
    private readonly apiKey = (process.env.TRIPAY_API_KEY || '').trim().replace(/^"|"$/g, '');
    private readonly privateKey = (process.env.TRIPAY_PRIVATE_KEY || '').trim().replace(/^"|"$/g, '');
    private readonly merchantCode = (process.env.TRIPAY_MERCHANT_CODE || '').trim().replace(/^"|"$/g, '');

    /**
     * Get all available payment channels from Tripay.
     * Falls back to a hardcoded list if Tripay API is unreachable (e.g. in Docker/local dev).
     */
    async getPaymentChannels() {
        try {
            const response = await axios.get(`${this.baseUrl}/merchant/payment-channel`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 8000, // 8s timeout
                maxRedirects: 0, // Don't follow redirects (302 means blocked)
            });

            if (response.data?.success && Array.isArray(response.data?.data)) {
                return response.data;
            }
            throw new Error('Invalid response from Tripay');
        } catch (error: any) {
            this.logger.warn('Tripay payment channels unavailable, using fallback list. Reason: ' + (error.message || 'Unknown'));

            // Fallback channels based on Tripay Sandbox active channels
            // Using null for icon_url so the code fallback text display is used
            const fallbackChannels = [
                { code: 'QRISC', name: 'QRIS', group: 'QRIS', type: 'DIRECT', fee_flat: 0, fee_percent: 0.7, icon_url: null, active: true },
                { code: 'BNIVA', name: 'BNI Virtual Account', group: 'Virtual Account', type: 'DIRECT', fee_flat: 4250, fee_percent: 0, icon_url: null, active: true },
                { code: 'BRIVA', name: 'BRI Virtual Account', group: 'Virtual Account', type: 'DIRECT', fee_flat: 4250, fee_percent: 0, icon_url: null, active: true },
                { code: 'BCAVA', name: 'BCA Virtual Account', group: 'Virtual Account', type: 'DIRECT', fee_flat: 5500, fee_percent: 0, icon_url: null, active: true },
                { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', group: 'Virtual Account', type: 'DIRECT', fee_flat: 4250, fee_percent: 0, icon_url: null, active: true },
                { code: 'PERMATAVA', name: 'Permata Virtual Account', group: 'Virtual Account', type: 'DIRECT', fee_flat: 4250, fee_percent: 0, icon_url: null, active: true },
                { code: 'DANA', name: 'DANA', group: 'E-Wallet', type: 'REDIRECT', fee_flat: 0, fee_percent: 0.7, icon_url: null, active: true },
                { code: 'OVO', name: 'OVO', group: 'E-Wallet', type: 'REDIRECT', fee_flat: 0, fee_percent: 0.7, icon_url: null, active: true },
                { code: 'SHOPEEPAY', name: 'ShopeePay', group: 'E-Wallet', type: 'REDIRECT', fee_flat: 0, fee_percent: 0.7, icon_url: null, active: true },
                { code: 'GOPAY', name: 'GoPay', group: 'E-Wallet', type: 'REDIRECT', fee_flat: 0, fee_percent: 0.7, icon_url: null, active: true },
                { code: 'ALFAMART', name: 'Alfamart', group: 'Convenience Store', type: 'DIRECT', fee_flat: 2500, fee_percent: 0, icon_url: null, active: true },
                { code: 'INDOMARET', name: 'Indomaret', group: 'Convenience Store', type: 'DIRECT', fee_flat: 2500, fee_percent: 0, icon_url: null, active: true },
            ];

            return { success: true, data: fallbackChannels };
        }
    }

    /**
     * Request a closed payment transaction
     */
    async requestTransaction(payload: any) {
        try {
            // Ensure amount is integer for signature (HMAC-SHA256(merchantCode + merchantRef + amount))
            const amount = Math.floor(Number(payload.amount));
            this.logger.log(`Tripay Auth Debug:`);
            this.logger.log(`- API Key: ${this.apiKey.substring(0, 8)}... (Length: ${this.apiKey.length})`);
            this.logger.log(`- API Key Hex: ${Buffer.from(this.apiKey).toString('hex')}`);
            this.logger.log(`- Merchant Code: [${this.merchantCode}]`);
            this.logger.log(`- Base URL: ${this.baseUrl}`);

            const signature = crypto.createHmac('sha256', this.privateKey)
                .update(this.merchantCode + payload.merchant_ref + amount)
                .digest('hex');

            // Format order_items according to documentation (sku, name, price, quantity, subtotal required)
            const items = (payload.order_items || []).map((item: any) => {
                const itemPrice = Math.floor(Number(item.price));
                const itemQty = Math.floor(Number(item.quantity));
                return {
                    sku: (item.sku || 'PROD').toString(),
                    name: (item.name || 'Product').toString(),
                    price: itemPrice,
                    quantity: itemQty,
                    subtotal: itemPrice * itemQty, // Required by documentation
                    product_url: item.product_url || undefined,
                    image_url: item.image_url || undefined
                };
            });

            const data = {
                method: payload.method,
                merchant_ref: payload.merchant_ref,
                amount: amount,
                customer_name: (payload.customer_name || 'Pelanggan').toString().trim(),
                customer_email: (payload.customer_email || 'guest@dagangplay.com').toString().trim(),
                customer_phone: payload.customer_phone || undefined,
                order_items: items,
                callback_url: (process.env.TRIPAY_CALLBACK_URL || '').trim().replace(/^"|"$/g, ''),
                return_url: (payload.return_url || process.env.FRONTEND_URL || 'http://localhost:3000').toString().trim(),
                expired_time: payload.expired_time || (Math.floor(Date.now() / 1000) + (24 * 60 * 60)), // 24 hours
                signature
            };

            this.logger.log(`Requesting Tripay Transaction: ${payload.merchant_ref} - Amount: ${amount} - Method: ${payload.method}`);

            const response = await axios.post(`${this.baseUrl}/transaction/create`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'DagangPlay-Backend/1.0'
                }
            });

            if (response.data?.success) {
                return response.data;
            } else {
                this.logger.error('Tripay API Error Response:', JSON.stringify(response.data));
                throw new Error(response.data?.message || 'Gagal membuat transaksi di Tripay');
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || error.message || 'Unknown Error';
            
            this.logger.error('Tripay Request Failed:', {
                message: errorMsg,
                status: error.response?.status,
                data: errorData ? JSON.stringify(errorData) : 'No data'
            });
            throw new Error(`Tripay Error: ${errorMsg}`);
        }
    }

    /**
     * Verify Callback Signature from Tripay
     */
    verifySignature(callbackSignature: string, payload: string | Buffer): boolean {
        // Payload MUST be the raw JSON from the request body
        const signature = crypto.createHmac('sha256', this.privateKey)
            .update(payload)
            .digest('hex');

        return signature === callbackSignature;
    }
}
