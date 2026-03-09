import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';
export declare class TripayController {
    private readonly tripayService;
    constructor(tripayService: TripayService);
    getPaymentChannels(): Promise<any>;
    tripayCallback(signature: string, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
