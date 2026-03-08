"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let WorkersService = WorkersService_1 = class WorkersService {
    prisma;
    logger = new common_1.Logger(WorkersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleJobQueue() {
        this.logger.debug('Menjalankan background jobs Worker dari JobQueue Prisma...');
        const pendingJobs = await this.prisma.jobQueue.findMany({
            where: { status: client_1.JobStatus.PENDING },
            take: 10
        });
        for (const job of pendingJobs) {
            try {
                await this.prisma.jobQueue.update({ where: { id: job.id }, data: { status: client_1.JobStatus.RUNNING } });
                if (job.type === 'SYNC_SUPPLIER') {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status: client_1.JobStatus.SUCCESS, completedAt: new Date() }
                });
                this.logger.log(`Job ${job.id} type ${job.type} SUCCESS`);
            }
            catch (e) {
                const retries = (job.retryCount || 0) + 1;
                const status = retries >= 3 ? client_1.JobStatus.FAILED : client_1.JobStatus.RETRYING;
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status, retryCount: retries, error: e.message }
                });
                this.logger.error(`Job ${job.id} FAILED, Retry count: ${retries}`);
            }
        }
    }
    async checkSubscriptions() {
        this.logger.debug('Auditing merchant subscription...');
    }
};
exports.WorkersService = WorkersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "handleJobQueue", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "checkSubscriptions", null);
exports.WorkersService = WorkersService = WorkersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkersService);
//# sourceMappingURL=workers.service.js.map