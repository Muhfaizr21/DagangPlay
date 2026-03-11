import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
    private readonly logger = new Logger(TripayService.name);
    // Determine base URL conditionally based on environment if needed, but for now use the one from .env
    private readonly baseUrl = process.env.TRIPAY_URL || 'https://tripay.co.id/api-sandbox';
    private readonly apiKey = process.env.TRIPAY_API_KEY!;
    private readonly privateKey = process.env.TRIPAY_PRIVATE_KEY!;
    private readonly merchantCode = process.env.TRIPAY_MERCHANT_CODE!;

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
            // Ensure amount is integer for signature
            const amount = Math.floor(Number(payload.amount));
            const signatureStr = `${this.merchantCode}${payload.merchant_ref}${amount}`;

            this.logger.debug(`Signature Debug:`);
            this.logger.debug(`- Merchant Code: [${this.merchantCode}]`);
            this.logger.debug(`- Merchant Ref: [${payload.merchant_ref}]`);
            this.logger.debug(`- Amount: [${amount}]`);
            this.logger.debug(`- Full Signature String: [${signatureStr}]`);
            this.logger.debug(`- Private Key used (ends with): ...${this.privateKey.slice(-5)}`);

            const signature = crypto.createHmac('sha256', this.privateKey)
                .update(signatureStr)
                .digest('hex');

            this.logger.debug(`- Generated Signature: [${signature}]`);

            // Map items to include subtotal if missing
            const items = (payload.order_items || []).map((item: any) => ({
                ...item,
                subtotal: item.subtotal || (item.price * item.quantity)
            }));

            const data = {
                method: payload.method,
                merchant_ref: payload.merchant_ref,
                amount: amount,
                customer_name: payload.customer_name || 'Pelanggan DagangPlay',
                customer_email: payload.customer_email || 'guest@dagangplay.com',
                customer_phone: payload.customer_phone,
                order_items: items,
                callback_url: process.env.TRIPAY_CALLBACK_URL,
                return_url: payload.return_url || process.env.FRONTEND_URL || 'http://localhost:3000', // Redirect back to store
                expired_time: payload.expired_time || (Math.floor(Date.now() / 1000) + (24 * 60 * 60)), // 24 hours default
                signature
            };

            const response = await axios.post(`${this.baseUrl}/transaction/create`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data;
        } catch (error: any) {
            this.logger.error('Failed to request Tripay transaction:', error.response?.data || error.message);
            throw error.response?.data || new Error('Gagal memproses transaksi');
        }
    }

    /**
     * Verify Callback Signature from Tripay
     */
    verifySignature(callbackSignature: string, jsonPayload: string): boolean {
        const signature = crypto.createHmac('sha256', this.privateKey)
            .update(jsonPayload)
            .digest('hex');

        return signature === callbackSignature;
    }
}
