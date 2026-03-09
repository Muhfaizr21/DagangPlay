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
     * Get all available payment channels from Tripay
     */
    async getPaymentChannels() {
        try {
            const response = await axios.get(`${this.baseUrl}/merchant/payment-channel`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error: any) {
            this.logger.error('Failed to get Tripay payment channels:', error.response?.data || error.message);
            throw new Error('Gagal mendapatkan metode pembayaran');
        }
    }

    /**
     * Request a closed payment transaction
     */
    async requestTransaction(payload: any) {
        try {
            // Generate Signature: HMAC-SHA256(merchantCode + merchantRef + amount, privateKey)
            const signatureStr = `${this.merchantCode}${payload.merchant_ref}${payload.amount}`;
            const signature = crypto.createHmac('sha256', this.privateKey)
                .update(signatureStr)
                .digest('hex');

            const data = {
                method: payload.method,
                merchant_ref: payload.merchant_ref,
                amount: payload.amount,
                customer_name: payload.customer_name || 'Pelanggan DagangPlay',
                customer_email: payload.customer_email || 'guest@dagangplay.com',
                customer_phone: payload.customer_phone,
                order_items: payload.order_items,
                return_url: payload.return_url || 'http://localhost:3000', // Redirect back to store
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
