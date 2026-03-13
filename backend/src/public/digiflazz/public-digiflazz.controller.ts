import { Controller, Post, Body, Headers, HttpStatus, Res, Req } from '@nestjs/common';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Controller('public/digiflazz')
export class PublicDigiflazzController {
    constructor(private readonly digiflazzService: DigiflazzService) { }

    /**
     * Webhook Callback from Digiflazz
     * Header: X-Digiflazz-Event (Price Change, Transaction Status)
     */
    @Post('webhook')
    async handleWebhook(
        @Headers('x-digiflazz-delivery') delivery: string,
        @Headers('x-digiflazz-event') event: string,
        @Body() body: any,
        @Req() req: any,
        @Res() res: any
    ) {
        try {
            console.log(`[DigiflazzWebhook] Event: ${event}, Delivery: ${delivery}, IP: ${req.ip}`);

            // 1. SECURITY: IP Whitelist (Digiflazz documented IPs)
            const allowedIPs = ['103.253.212.43', '128.199.231.57', '103.111.94.131', '::ffff:103.253.212.43', '::ffff:128.199.231.57', '::ffff:103.111.94.131'];
            if (!allowedIPs.includes(req.ip) && process.env.NODE_ENV === 'production') {
                console.warn(`[DigiflazzWebhook] Unauthorized IP Attempt: ${req.ip}`);
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Forbidden IP' });
            }

            // 2. SECURITY: Signature Verification
            const refId = body.data?.ref_id || body.data?.[0]?.buyer_sku_code; // ref_id for trans, buyer_sku_code for price
            const isValid = this.digiflazzService.verifyWebhookSignature(body.sign || '', event, refId);
            if (!isValid) {
                console.warn(`[DigiflazzWebhook] Invalid signature from ${req.ip}`);
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }

            // 3. PRICE CHANGE EVENT
            if (event === 'price') {
                await this.digiflazzService.processPriceWebhook(body.data);
            }

            // 4. TRANSACTION STATUS CHANGE
            if (event === 'transaction') {
                await this.digiflazzService.processTransactionWebhook(body.data);
            }

            return res.status(HttpStatus.OK).json({ success: true });
        } catch (err: any) {
            console.error('[DigiflazzWebhook] Error:', err.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false });
        }
    }
}
