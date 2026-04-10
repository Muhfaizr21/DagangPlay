import { Injectable, BadRequestException } from '@nestjs/common';
import { WhatsappService } from 'src/common/notifications/whatsapp.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PublicOtpService {
  // In-memory OTP storage (better to use Redis in PRODUCTION)
  private otps = new Map<string, { code: string; expires: number }>();

  constructor(
    private whatsapp: WhatsappService,
    private prisma: PrismaService,
  ) {}

  async sendOtp(phone: string, merchantId: string) {
    // 1. Verify if it's actually a reseller
    const user = await this.prisma.user.findFirst({
      where: { phone, merchantId },
    });

    if (!user || user.role !== Role.RESELLER) {
      throw new BadRequestException(
        'Hanya Reseller yang membutuhkan verifikasi OTP untuk harga khusus.',
      );
    }

    // 2. Generate OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.otps.set(phone + merchantId, { code, expires });

    // 3. Send via WhatsApp
    const msg =
      `🔐 *KODE VERIFIKASI RESELLER*\n\n` +
      `Kode OTP Anda adalah: *${code}*\n` +
      `Berlaku selama 5 menit.\n\n` +
      `Gunakan kode ini untuk mengkonfirmasi pesanan Anda di DagangPlay.`;

    await this.whatsapp.sendMessage(phone, msg);

    return { success: true, message: 'OTP terkirim ke WhatsApp Anda' };
  }

  async verifyOtp(phone: string, merchantId: string, code: string) {
    const stored = this.otps.get(phone + merchantId);

    if (!stored)
      throw new BadRequestException(
        'OTP tidak ditemukan atau sudah kadaluarsa.',
      );
    if (stored.expires < Date.now()) {
      this.otps.delete(phone + merchantId);
      throw new BadRequestException('OTP sudah kadaluarsa.');
    }
    if (stored.code !== code) {
      throw new BadRequestException('Kode OTP salah.');
    }

    // Generate a simple verification token (not a JWT for simplicity, just a session-based check)
    const token = crypto.randomBytes(32).toString('hex');
    this.otps.set('verified_' + phone + merchantId, {
      code: token,
      expires: Date.now() + 10 * 60 * 1000,
    });

    return { success: true, token };
  }

  isVerified(phone: string, merchantId: string, token: string): boolean {
    const stored = this.otps.get('verified_' + phone + merchantId);
    if (!stored || stored.code !== token || stored.expires < Date.now())
      return false;
    return true;
  }
}
