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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDigiflazzController = void 0;
const common_1 = require("@nestjs/common");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
let PublicDigiflazzController = class PublicDigiflazzController {
    digiflazzService;
    constructor(digiflazzService) {
        this.digiflazzService = digiflazzService;
    }
    async handleWebhook(delivery, event, body, res) {
        try {
            console.log(`[DigiflazzWebhook] Event: ${event}, Delivery: ${delivery}`);
            if (event === 'price') {
                await this.digiflazzService.processPriceWebhook(body.data);
            }
            if (event === 'transaction') {
                await this.digiflazzService.processTransactionWebhook(body.data);
            }
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (err) {
            console.error('[DigiflazzWebhook] Error:', err.message);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false });
        }
    }
};
exports.PublicDigiflazzController = PublicDigiflazzController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('x-digiflazz-delivery')),
    __param(1, (0, common_1.Headers)('x-digiflazz-event')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PublicDigiflazzController.prototype, "handleWebhook", null);
exports.PublicDigiflazzController = PublicDigiflazzController = __decorate([
    (0, common_1.Controller)('public/digiflazz'),
    __metadata("design:paramtypes", [digiflazz_service_1.DigiflazzService])
], PublicDigiflazzController);
//# sourceMappingURL=public-digiflazz.controller.js.map