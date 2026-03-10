"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDigiflazzModule = void 0;
const common_1 = require("@nestjs/common");
const public_digiflazz_controller_1 = require("./public-digiflazz.controller");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
const prisma_service_1 = require("../../prisma.service");
let PublicDigiflazzModule = class PublicDigiflazzModule {
};
exports.PublicDigiflazzModule = PublicDigiflazzModule;
exports.PublicDigiflazzModule = PublicDigiflazzModule = __decorate([
    (0, common_1.Module)({
        controllers: [public_digiflazz_controller_1.PublicDigiflazzController],
        providers: [digiflazz_service_1.DigiflazzService, prisma_service_1.PrismaService],
        exports: [digiflazz_service_1.DigiflazzService]
    })
], PublicDigiflazzModule);
//# sourceMappingURL=public-digiflazz.module.js.map