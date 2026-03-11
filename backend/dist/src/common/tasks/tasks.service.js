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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCleanup() {
        this.logger.log('Starting daily cleanup task...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const expiredInvoices = await this.prisma.invoice.updateMany({
                where: {
                    status: 'UNPAID',
                    createdAt: { lt: thirtyDaysAgo },
                },
                data: {
                    status: 'OVERDUE',
                },
            });
            this.logger.log(`Cleaned up ${expiredInvoices.count} expired invoices.`);
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const deletedLogs = await this.prisma.auditLog.deleteMany({
                where: {
                    createdAt: { lt: ninetyDaysAgo },
                    action: { notIn: ['SUBSCRIBE_MERCHANT', 'WITHDRAWAL_COMPLETED', 'ORDER_SUCCESS'] }
                },
            });
            this.logger.log(`Deleted ${deletedLogs.count} old audit logs.`);
            const deletedOtps = await this.prisma.otpVerification.deleteMany({
                where: {
                    expiresAt: { lt: new Date() },
                },
            });
            this.logger.log(`Deleted ${deletedOtps.count} expired OTP tokens.`);
            const thirtyDaysAgoLogs = new Date();
            thirtyDaysAgoLogs.setDate(thirtyDaysAgoLogs.getDate() - 30);
            await this.prisma.loginAttempt.deleteMany({
                where: { createdAt: { lt: thirtyDaysAgoLogs } }
            });
            await this.prisma.userSession.deleteMany({
                where: { expiresAt: { lt: new Date() } }
            });
        }
        catch (error) {
            this.logger.error('Error during cleanup task:', error);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleCleanup", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map