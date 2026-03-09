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
exports.PrismaService = void 0;
require("dotenv/config");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let prismaInstance = null;
function createPrismaClient() {
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({ adapter });
}
let PrismaService = class PrismaService {
    client;
    constructor() {
        if (!prismaInstance) {
            prismaInstance = createPrismaClient();
        }
        this.client = prismaInstance;
    }
    get $transaction() {
        return this.client.$transaction.bind(this.client);
    }
    get user() { return this.client.user; }
    get order() { return this.client.order; }
    get merchant() { return this.client.merchant; }
    get auditLog() { return this.client.auditLog; }
    get category() { return this.client.category; }
    get product() { return this.client.product; }
    get productSku() { return this.client.productSku; }
    get supplier() { return this.client.supplier; }
    get supplierLog() { return this.client.supplierLog; }
    get supplierBalanceHistory() { return this.client.supplierBalanceHistory; }
    get userSession() { return this.client.userSession; }
    get balanceTransaction() { return this.client.balanceTransaction; }
    get deposit() { return this.client.deposit; }
    get withdrawal() { return this.client.withdrawal; }
    get orderStatusHistory() { return this.client.orderStatusHistory; }
    get fraudDetection() { return this.client.fraudDetection; }
    get commission() { return this.client.commission; }
    get mLMCommission() { return this.client.mLMCommission; }
    get downlineTree() { return this.client.downlineTree; }
    get promoCode() { return this.client.promoCode; }
    get promoUsage() { return this.client.promoUsage; }
    get invoice() { return this.client.invoice; }
    get subscriptionHistory() { return this.client.subscriptionHistory; }
    get systemSetting() { return this.client.systemSetting; }
    get banner() { return this.client.banner; }
    get announcement() { return this.client.announcement; }
    get emailCampaign() { return this.client.emailCampaign; }
    get iPBlacklist() { return this.client.iPBlacklist; }
    get supportTicket() { return this.client.supportTicket; }
    get supportTicketReply() { return this.client.supportTicketReply; }
    get loginAttempt() { return this.client.loginAttempt; }
    get jobQueue() { return this.client.jobQueue; }
    get notificationTemplate() { return this.client.notificationTemplate; }
    get merchantProductPrice() { return this.client.merchantProductPrice; }
    get merchantMember() { return this.client.merchantMember; }
    get tierPricingRule() { return this.client.tierPricingRule; }
    get planTierMapping() { return this.client.planTierMapping; }
    get tierPriceHistory() { return this.client.tierPriceHistory; }
    get webhookEndpoint() { return this.client.webhookEndpoint; }
    get paymentChannel() { return this.client.paymentChannel; }
    async onModuleInit() {
        await this.client.$connect();
    }
    async onModuleDestroy() {
        await this.client.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map