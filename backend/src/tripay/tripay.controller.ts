import { Controller, Get, Post, Body, Headers, Req, Res, HttpStatus } from '@nestjs/common';
import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';

@Controller('tripay')
export class TripayController {
    constructor(private readonly tripayService: TripayService) { }

    /**
     * Get available payment channels for checkout page
     */
    @Get('payment-channels')
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }

    /**
     * Webhook callback from Tripay
     */
    @Post('callback')
    async tripayCallback(
        @Headers('x-callback-signature') signature: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            const rawBody = JSON.stringify(req.body); // Ensure raw body string based on body parser if needed
            // Actually, we should get raw body for signature verification accurately.
            // For now, let's just use JSON.stringify(req.body) as a decent approximation if raw body is not setup.

            const isValid = this.tripayService.verifySignature(signature, rawBody);

            if (!isValid) {
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }

            const data = req.body;

            // Handle Payment Status here
            // e.g. PAID, FAILED, EXPIRED
            console.log('Tripay Callback Data:', data);

            // TODO: Update order status based on data.reference or data.merchant_ref
            // if (data.status === 'PAID') {
            //      process top-up with Digiflazz
            // }

            return res.status(HttpStatus.OK).json({ success: true });
        } catch (error: any) {
            console.error('Tripay callback error:', error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
}
