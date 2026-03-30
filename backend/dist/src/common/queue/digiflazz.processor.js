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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiflazzProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
let DigiflazzProcessor = class DigiflazzProcessor extends bullmq_1.WorkerHost {
    digiflazzService;
    constructor(digiflazzService) {
        super();
        this.digiflazzService = digiflazzService;
    }
    async process(job) {
        const { orderId } = job.data;
        console.log(`[DigiflazzWorker] Memproses pesanan otomatis untuk orderId: ${orderId}`);
        try {
            const result = await this.digiflazzService.placeOrder(orderId);
            return { success: true, result };
        }
        catch (err) {
            console.error(`[DigiflazzWorker] Gagal memproses order ${orderId}:`, err.message);
            throw err;
        }
    }
};
exports.DigiflazzProcessor = DigiflazzProcessor;
exports.DigiflazzProcessor = DigiflazzProcessor = __decorate([
    (0, bullmq_1.Processor)('digiflazz-fulfillment'),
    __metadata("design:paramtypes", [digiflazz_service_1.DigiflazzService])
], DigiflazzProcessor);
//# sourceMappingURL=digiflazz.processor.js.map