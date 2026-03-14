"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WhatsappService = class WhatsappService {
    apiKey = process.env.WHATSAPP_API_KEY;
    apiUrl = process.env.WHATSAPP_URL || 'https://api.fonnte.com/send';
    adminPhone = '083866623090';
    async sendMessage(target, message) {
        if (!this.apiKey || this.apiKey === 'Y5F6Cp5VMBeJjF1KJNUr') {
            console.log('[Whatsapp] Attempting to send message via Fonnte API...');
        }
        try {
            const response = await axios_1.default.post(this.apiUrl, {
                target,
                message,
            }, {
                headers: {
                    Authorization: this.apiKey,
                }
            });
            console.log(`[Whatsapp] API Success for ${target}:`, response.data);
            return response.data;
        }
        catch (error) {
            console.error(`[Whatsapp] API Error for ${target}:`, error.response?.data || error.message);
            return null;
        }
    }
    async sendOrderNotification(phone, orderNumber, productName, totalPrice, paymentUrl) {
        const msg = `🔔 *PESANAN BARU - DAGANGPLAY*\n\n` +
            `Terima kasih telah memesan!\n` +
            `Order ID: *${orderNumber}*\n` +
            `Produk: ${productName}\n` +
            `Total: Rp ${totalPrice.toLocaleString('id-ID')}\n\n` +
            `Silakan selesaikan pembayaran di sini:\n${paymentUrl}\n\n` +
            `_Pesanan akan diproses otomatis setelah pembayaran lunas._`;
        return this.sendMessage(phone, msg);
    }
    async sendFulfillmentNotification(phone, orderNumber, productName, status, sn) {
        const statusEmoji = status === 'SUCCESS' ? '✅' : '❌';
        let msg = `${statusEmoji} *UPDATE PESANAN - DAGANGPLAY*\n\n` +
            `Order ID: *${orderNumber}*\n` +
            `Produk: ${productName}\n` +
            `Status: *${status}*\n`;
        if (sn && sn !== 'N/A') {
            msg += `SN/Voucher: *${sn}*\n\n`;
        }
        else if (status === 'SUCCESS') {
            msg += `\nProduk telah berhasil masuk ke akun Anda.\n\n`;
        }
        msg += `Terima kasih telah berbelanja di store kami!`;
        return this.sendMessage(phone, msg);
    }
    async sendAdminSummary(content) {
        const msg = `📢 *ADMIN NOTIFICATION - DAGANGPLAY*\n\n` + content;
        return this.sendMessage(this.adminPhone, msg);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)()
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map