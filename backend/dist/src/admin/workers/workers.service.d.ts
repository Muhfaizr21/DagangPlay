import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz/digiflazz.service';
export declare class WorkersService {
    private prisma;
    private digiflazz;
    private readonly logger;
    constructor(prisma: PrismaService, digiflazz: DigiflazzService);
    handleJobQueue(): Promise<void>;
    checkSubscriptions(): Promise<void>;
    syncFulfillmentStatus(): Promise<void>;
    syncProductsFromSupplier(): Promise<void>;
    syncSupplierBalance(): Promise<void>;
}
