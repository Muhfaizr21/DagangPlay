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
exports.TripayController = void 0;
const common_1 = require("@nestjs/common");
const tripay_service_1 = require("./tripay.service");
let TripayController = class TripayController {
    tripayService;
    constructor(tripayService) {
        this.tripayService = tripayService;
    }
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }
    async tripayCallback(signature, req, res) {
        try {
            const rawBody = JSON.stringify(req.body);
            const isValid = this.tripayService.verifySignature(signature, rawBody);
            if (!isValid) {
                return res.status(common_1.HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }
            const data = req.body;
            console.log('Tripay Callback Data:', data);
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            console.error('Tripay callback error:', error.message);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
};
exports.TripayController = TripayController;
__decorate([
    (0, common_1.Get)('payment-channels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TripayController.prototype, "getPaymentChannels", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Headers)('x-callback-signature')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TripayController.prototype, "tripayCallback", null);
exports.TripayController = TripayController = __decorate([
    (0, common_1.Controller)('tripay'),
    __metadata("design:paramtypes", [tripay_service_1.TripayService])
], TripayController);
//# sourceMappingURL=tripay.controller.js.map