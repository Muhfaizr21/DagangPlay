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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesPerformance(merchantId, query) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        let startDate = new Date(today);
        let dataPoints = 7;
        let groupBy = 'day';
        switch (query.range) {
            case '1m':
                startDate.setMonth(today.getMonth() - 1);
                dataPoints = 30;
                groupBy = 'day';
                break;
            case '1y':
                startDate.setFullYear(today.getFullYear() - 1);
                dataPoints = 12;
                groupBy = 'month';
                break;
            case 'all':
                startDate = undefined;
                dataPoints = 5;
                groupBy = 'year';
                break;
            case '7d':
            default:
                startDate.setDate(today.getDate() - 6);
                dataPoints = 7;
                groupBy = 'day';
                break;
        }
        if (startDate)
            startDate.setHours(0, 0, 0, 0);
        const dateFilter = startDate ? { gte: startDate, lte: today } : undefined;
        const totalOrders = await this.prisma.order.count({
            where: { merchantId, ...(dateFilter && { createdAt: dateFilter }) }
        });
        const successOrders = await this.prisma.order.count({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) }
        });
        const sumResult = await this.prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) }
        });
        const recentOrders = await this.prisma.order.findMany({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) },
            select: { totalPrice: true, createdAt: true }
        });
        const chartData = [];
        for (let i = dataPoints - 1; i >= 0; i--) {
            const d = new Date();
            let dateLabel = '';
            if (groupBy === 'day') {
                d.setDate(d.getDate() - i);
                dateLabel = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            }
            else if (groupBy === 'month') {
                d.setMonth(d.getMonth() - i);
                dateLabel = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            }
            else if (groupBy === 'year') {
                d.setFullYear(d.getFullYear() - i);
                dateLabel = d.toLocaleDateString('id-ID', { year: 'numeric' });
            }
            const dailyRevenue = recentOrders.reduce((sum, order) => {
                const orderDate = new Date(order.createdAt);
                if (groupBy === 'day' && orderDate.getDate() === d.getDate() && orderDate.getMonth() === d.getMonth()) {
                    return sum + Number(order.totalPrice || 0);
                }
                else if (groupBy === 'month' && orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear()) {
                    return sum + Number(order.totalPrice || 0);
                }
                else if (groupBy === 'year' && orderDate.getFullYear() === d.getFullYear()) {
                    return sum + Number(order.totalPrice || 0);
                }
                return sum;
            }, 0);
            chartData.push({ date: dateLabel, revenue: dailyRevenue });
        }
        return {
            summary: {
                totalOrders,
                successOrders,
                totalRevenue: sumResult._sum.totalPrice || 0,
            },
            chart: chartData
        };
    }
    async getProductPerformance(merchantId) {
        return [];
    }
    async getResellerPerformance(merchantId) {
        return [];
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map