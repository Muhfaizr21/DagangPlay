import { PrismaService } from '../../prisma.service';
export declare class WorkersService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleJobQueue(): Promise<void>;
    checkSubscriptions(): Promise<void>;
}
