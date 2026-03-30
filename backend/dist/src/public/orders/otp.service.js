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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOtpService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../common/notifications/whatsapp.service");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let PublicOtpService = class PublicOtpService {
    whatsapp;
    prisma;
    otps = new Map();
    constructor(whatsapp, prisma) {
        this.whatsapp = whatsapp;
        this.prisma = prisma;
    }
    async sendOtp(phone, merchantId) {
        const user = await this.prisma.user.findFirst({
            where: { phone, merchantId }
        });
        if (!user || user.role !== client_1.Role.RESELLER) {
            throw new common_1.BadRequestException('Hanya Reseller yang membutuhkan verifikasi OTP untuk harga khusus.');
        }
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expires = Date.now() + 5 * 60 * 1000;
        this.otps.set(phone + merchantId, { code, expires });
        const msg = `🔐 *KODE VERIFIKASI RESELLER*\n\n` +
            `Kode OTP Anda adalah: *${code}*\n` +
            `Berlaku selama 5 menit.\n\n` +
            `Gunakan kode ini untuk mengkonfirmasi pesanan Anda di DagangPlay.`;
        await this.whatsapp.sendMessage(phone, msg);
        return { success: true, message: 'OTP terkirim ke WhatsApp Anda' };
    }
    async verifyOtp(phone, merchantId, code) {
        const stored = this.otps.get(phone + merchantId);
        if (!stored)
            throw new common_1.BadRequestException('OTP tidak ditemukan atau sudah kadaluarsa.');
        if (stored.expires < Date.now()) {
            this.otps.delete(phone + merchantId);
            throw new common_1.BadRequestException('OTP sudah kadaluarsa.');
        }
        if (stored.code !== code) {
            throw new common_1.BadRequestException('Kode OTP salah.');
        }
        const token = crypto.randomBytes(32).toString('hex');
        this.otps.set('verified_' + phone + merchantId, { code: token, expires: Date.now() + 10 * 60 * 1000 });
        return { success: true, token };
    }
    isVerified(phone, merchantId, token) {
        const stored = this.otps.get('verified_' + phone + merchantId);
        if (!stored || stored.code !== token || stored.expires < Date.now())
            return false;
        return true;
    }
};
exports.PublicOtpService = PublicOtpService;
exports.PublicOtpService = PublicOtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        prisma_service_1.PrismaService])
], PublicOtpService);
//# sourceMappingURL=otp.service.js.map