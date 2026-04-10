import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TripayService {
  private readonly logger = new Logger(TripayService.name);
  private readonly baseUrl = (
    process.env.TRIPAY_URL || 'https://tripay.co.id/api-sandbox'
  )
    .trim()
    .replace(/\/$/, '');
  private readonly apiKey = (process.env.TRIPAY_API_KEY || '')
    .trim()
    .replace(/^"|"$/g, '');
  private readonly privateKey = (process.env.TRIPAY_PRIVATE_KEY || '')
    .trim()
    .replace(/^"|"$/g, '');
  private readonly merchantCode = (process.env.TRIPAY_MERCHANT_CODE || '')
    .trim()
    .replace(/^"|"$/g, '');

  constructor(private prisma: PrismaService) {}

  /**
   * Helper to get Tripay configurations for a specific merchant or fallback to platform.
   */
  private async getConfigs(merchantId?: string) {
    if (!merchantId) {
      return {
        apiKey: this.apiKey,
        privateKey: this.privateKey,
        merchantCode: this.merchantCode,
      };
    }

    const settings = await this.prisma.merchantSetting.findMany({
      where: {
        merchantId,
        key: {
          in: ['TRIPAY_API_KEY', 'TRIPAY_PRIVATE_KEY', 'TRIPAY_MERCHANT_CODE'],
        },
      },
    });

    const keyMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as any,
    );

    return {
      apiKey: keyMap['TRIPAY_API_KEY'] || this.apiKey,
      privateKey: keyMap['TRIPAY_PRIVATE_KEY'] || this.privateKey,
      merchantCode: keyMap['TRIPAY_MERCHANT_CODE'] || this.merchantCode,
    };
  }

  /**
   * Get all available payment channels from Tripay.
   */
  async getPaymentChannels(merchantId?: string) {
    const { apiKey } = await this.getConfigs(merchantId);
    try {
      const response = await axios.get(
        `${this.baseUrl}/merchant/payment-channel`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 8000,
        },
      );

      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data;
      }
      throw new Error('Invalid response from Tripay');
    } catch (error: any) {
      this.logger.warn(
        `Tripay channels unavailable for merchant ${merchantId || 'PLATFORM'}. Using fallback.`,
      );

      const fallbackChannels = [
        {
          code: 'QRISC',
          name: 'QRIS',
          group: 'QRIS',
          type: 'DIRECT',
          fee_flat: 0,
          fee_percent: 0.7,
          icon_url: null,
          active: true,
        },
        {
          code: 'BNIVA',
          name: 'BNI Virtual Account',
          group: 'Virtual Account',
          type: 'DIRECT',
          fee_flat: 4250,
          fee_percent: 0,
          icon_url: null,
          active: true,
        },
        {
          code: 'BRIVA',
          name: 'BRI Virtual Account',
          group: 'Virtual Account',
          type: 'DIRECT',
          fee_flat: 4250,
          fee_percent: 0,
          icon_url: null,
          active: true,
        },
        {
          code: 'BCAVA',
          name: 'BCA Virtual Account',
          group: 'Virtual Account',
          type: 'DIRECT',
          fee_flat: 5500,
          fee_percent: 0,
          icon_url: null,
          active: true,
        },
        {
          code: 'MANDIRIVA',
          name: 'Mandiri Virtual Account',
          group: 'Virtual Account',
          type: 'DIRECT',
          fee_flat: 4250,
          fee_percent: 0,
          icon_url: null,
          active: true,
        },
        {
          code: 'DANA',
          name: 'DANA',
          group: 'E-Wallet',
          type: 'REDIRECT',
          fee_flat: 0,
          fee_percent: 0.7,
          icon_url: null,
          active: true,
        },
        {
          code: 'OVO',
          name: 'OVO',
          group: 'E-Wallet',
          type: 'REDIRECT',
          fee_flat: 0,
          fee_percent: 0.7,
          icon_url: null,
          active: true,
        },
      ];

      return { success: true, data: fallbackChannels };
    }
  }

  /**
   * Request a closed payment transaction
   */
  async requestTransaction(payload: any, merchantId?: string) {
    const { apiKey, privateKey, merchantCode } =
      await this.getConfigs(merchantId);
    try {
      const amount = Math.floor(Number(payload.amount));
      const signature = crypto
        .createHmac('sha256', privateKey)
        .update(merchantCode + payload.merchant_ref + amount)
        .digest('hex');

      const items = (payload.order_items || []).map((item: any) => {
        const itemPrice = Math.floor(Number(item.price));
        const itemQty = Math.floor(Number(item.quantity));
        return {
          sku: (item.sku || 'PROD').toString(),
          name: (item.name || 'Product').toString(),
          price: itemPrice,
          quantity: itemQty,
          subtotal: itemPrice * itemQty,
        };
      });

      const data = {
        method: payload.method,
        merchant_ref: payload.merchant_ref,
        amount: amount,
        customer_name: (payload.customer_name || 'Pelanggan').toString().trim(),
        customer_email: (payload.customer_email || 'guest@dagangplay.com')
          .toString()
          .trim(),
        order_items: items,
        callback_url: (process.env.TRIPAY_CALLBACK_URL || '')
          .trim()
          .replace(/^"|"$/g, ''),
        return_url: (
          payload.return_url ||
          process.env.FRONTEND_URL ||
          'http://localhost:3000'
        )
          .toString()
          .trim(),
        expired_time:
          payload.expired_time || Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        signature,
      };

      const response = await axios.post(
        `${this.baseUrl}/transaction/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(
          response.data?.message || 'Gagal membuat transaksi di Tripay',
        );
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || 'Unknown Error';
      this.logger.error(
        `Tripay Request Failed for ${merchantId || 'PLATFORM'}: ${errorMsg}`,
      );
      throw new Error(`Tripay Error: ${errorMsg}`);
    }
  }

  /**
   * Verify Callback Signature from Tripay
   */
  async verifySignature(
    callbackSignature: string,
    payload: string | Buffer,
    merchantId?: string,
  ): Promise<boolean> {
    const { privateKey } = await this.getConfigs(merchantId);
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(payload)
      .digest('hex');

    return signature === callbackSignature;
  }
}
