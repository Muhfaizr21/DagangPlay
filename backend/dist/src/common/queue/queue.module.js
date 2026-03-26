"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueConfigModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const webhook_processor_1 = require("./webhook.processor");
const digiflazz_processor_1 = require("./digiflazz.processor");
const prisma_service_1 = require("../../prisma.service");
let QueueConfigModule = class QueueConfigModule {
};
exports.QueueConfigModule = QueueConfigModule;
exports.QueueConfigModule = QueueConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                useFactory: () => ({
                    connection: {
                        host: process.env.REDIS_HOST || '127.0.0.1',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                        password: process.env.REDIS_PASSWORD || undefined,
                    },
                }),
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'webhook',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'digiflazz-fulfillment',
            }),
        ],
        providers: [webhook_processor_1.WebhookProcessor, digiflazz_processor_1.DigiflazzProcessor, prisma_service_1.PrismaService],
        exports: [bullmq_1.BullModule],
    })
], QueueConfigModule);
//# sourceMappingURL=queue.module.js.map