import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';
import { Queue } from 'bullmq';
import { DigiflazzService } from '../admin/digiflazz/digiflazz.service';
import { WhatsappService } from '../common/notifications/whatsapp.service';
export declare class TripayController {
    private readonly tripayService;
    private prisma;
    private digiflazz;
    private whatsappService;
    private fulfillmentQueue;
    constructor(tripayService: TripayService, prisma: PrismaService, digiflazz: DigiflazzService, whatsappService: WhatsappService, fulfillmentQueue: Queue);
    getPaymentChannels(): Promise<any>;
    tripayCallback(signature: string, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
