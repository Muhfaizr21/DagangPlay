import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
    private readonly apiKey = process.env.WHATSAPP_API_KEY;
    private readonly apiUrl = process.env.WHATSAPP_URL || 'https://api.fonnte.com/send';
    private readonly adminPhone = '083866623090'; // Default Admin WA

    async sendMessage(target: string, message: string) {
        if (!this.apiKey || this.apiKey === 'Y5F6Cp5VMBeJjF1KJNUr') {
            // Check if it's the placeholder key from the prompt (if it's not the user's real one)
            // But since the user provided it in their .env snippet, I should try to use it.
            // However, I'll log securely.
            console.log('[Whatsapp] Attempting to send message via Fonnte API...');
        }

        try {
            const response = await axios.post(this.apiUrl, {
                target,
                message,
            }, {
                headers: {
                    Authorization: this.apiKey,
                }
            });
            console.log(`[Whatsapp] API Success for ${target}:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`[Whatsapp] API Error for ${target}:`, error.response?.data || error.message);
            return null;
        }
    }

    // High level methods
    async sendOrderNotification(phone: string, orderNumber: string, productName: string, totalPrice: number, paymentUrl: string) {
        const msg = `🔔 *PESANAN BARU - DAGANGPLAY*\n\n` +
                    `Terima kasih telah memesan!\n` +
                    `Order ID: *${orderNumber}*\n` +
                    `Produk: ${productName}\n` +
                    `Total: Rp ${totalPrice.toLocaleString('id-ID')}\n\n` +
                    `Silakan selesaikan pembayaran di sini:\n${paymentUrl}\n\n` +
                    `_Pesanan akan diproses otomatis setelah pembayaran lunas._`;
        
        return this.sendMessage(phone, msg);
    }

    async sendFulfillmentNotification(phone: string, orderNumber: string, productName: string, status: string, sn: string) {
        const statusEmoji = status === 'SUCCESS' ? '✅' : '❌';
        let msg = `${statusEmoji} *UPDATE PESANAN - DAGANGPLAY*\n\n` +
                  `Order ID: *${orderNumber}*\n` +
                  `Produk: ${productName}\n` +
                  `Status: *${status}*\n`;
        
        if (sn && sn !== 'N/A') {
            msg += `SN/Voucher: *${sn}*\n\n`;
        } else if (status === 'SUCCESS') {
            msg += `\nProduk telah berhasil masuk ke akun Anda.\n\n`;
        }

        msg += `Terima kasih telah berbelanja di store kami!`;
        
        return this.sendMessage(phone, msg);
    }

    async sendAdminSummary(content: string) {
        const msg = `📢 *ADMIN NOTIFICATION - DAGANGPLAY*\n\n` + content;
        return this.sendMessage(this.adminPhone, msg);
    }
}
