import { PrismaService } from '../../prisma.service';
export declare class TasksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCleanup(): Promise<void>;
}
