import { PrismaService } from '../../prisma.service';
import { WhatsappService } from '../notifications/whatsapp.service';
export declare class TasksService {
    private prisma;
    private whatsappService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    handleCleanup(): Promise<void>;
    handleFrequentChecks(): Promise<void>;
    monitorFails(): Promise<void>;
}
