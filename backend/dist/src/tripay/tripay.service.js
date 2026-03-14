"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TripayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripayService = void 0;
require("dotenv/config");
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
let TripayService = TripayService_1 = class TripayService {
    logger = new common_1.Logger(TripayService_1.name);
    baseUrl = (process.env.TRIPAY_URL || 'https://tripay.co.id/api-sandbox').trim().replace(/\/$/, '');
    apiKey = (process.env.TRIPAY_API_KEY || '').trim().replace(/^"|"$/g, '');
    privateKey = (process.env.TRIPAY_PRIVATE_KEY || '').trim().replace(/^"|"$/g, '');
    merchantCode = (process.env.TRIPAY_MERCHANT_CODE || '').trim().replace(/^"|"$/g, '');
    async getPaymentChannels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/merchant/payment-channel`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 8000,
                maxRedirects: 0,
            });
            if (response.data?.success && Array.isArray(response.data?.data)) {
                return response.data;
            }
            throw new Error('Invalid response from Tripay');
        }
        catch (error) {
            this.logger.warn('Tripay payment channels unavailable, using fallback list. Reason: ' + (error.message || 'Unknown'));
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
    async requestTransaction(payload) {
        try {
            const amount = Math.floor(Number(payload.amount));
            this.logger.log(`Tripay Auth Debug:`);
            this.logger.log(`- API Key: ${this.apiKey.substring(0, 8)}... (Length: ${this.apiKey.length})`);
            this.logger.log(`- API Key Hex: ${Buffer.from(this.apiKey).toString('hex')}`);
            this.logger.log(`- Merchant Code: [${this.merchantCode}]`);
            this.logger.log(`- Base URL: ${this.baseUrl}`);
            const signature = crypto.createHmac('sha256', this.privateKey)
                .update(this.merchantCode + payload.merchant_ref + amount)
                .digest('hex');
            const items = (payload.order_items || []).map((item) => {
                const itemPrice = Math.floor(Number(item.price));
                const itemQty = Math.floor(Number(item.quantity));
                return {
                    sku: (item.sku || 'PROD').toString(),
                    name: (item.name || 'Product').toString(),
                    price: itemPrice,
                    quantity: itemQty,
                    subtotal: itemPrice * itemQty,
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
                expired_time: payload.expired_time || (Math.floor(Date.now() / 1000) + (24 * 60 * 60)),
                signature
            };
            this.logger.log(`Requesting Tripay Transaction: ${payload.merchant_ref} - Amount: ${amount} - Method: ${payload.method}`);
            const response = await axios_1.default.post(`${this.baseUrl}/transaction/create`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'DagangPlay-Backend/1.0'
                }
            });
            if (response.data?.success) {
                return response.data;
            }
            else {
                this.logger.error('Tripay API Error Response:', JSON.stringify(response.data));
                throw new Error(response.data?.message || 'Gagal membuat transaksi di Tripay');
            }
        }
        catch (error) {
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
    verifySignature(callbackSignature, payload) {
        const signature = crypto.createHmac('sha256', this.privateKey)
            .update(payload)
            .digest('hex');
        return signature === callbackSignature;
    }
};
exports.TripayService = TripayService;
exports.TripayService = TripayService = TripayService_1 = __decorate([
    (0, common_1.Injectable)()
], TripayService);
//# sourceMappingURL=tripay.service.js.map