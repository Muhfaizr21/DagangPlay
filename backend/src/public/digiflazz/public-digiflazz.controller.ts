import { Controller, Post, Body, Headers, HttpStatus, Res } from '@nestjs/common';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import type { Response } from 'express';
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
        @Res() res: Response
    ) {
        try {
            console.log(`[DigiflazzWebhook] Event: ${event}, Delivery: ${delivery}`);

            // 1. PRICE CHANGE EVENT
            if (event === 'price') {
                await this.digiflazzService.processPriceWebhook(body.data);
            }

            // 2. TRANSACTION STATUS CHANGE
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
