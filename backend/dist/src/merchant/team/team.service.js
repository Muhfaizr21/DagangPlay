"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let TeamService = class TeamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeamMembers(merchantId) {
        return this.prisma.merchantMember.findMany({
            where: { merchantId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
    }
    async addTeamMember(merchantId, data) {
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            if (data.phone) {
                const phoneExist = await this.prisma.user.findUnique({ where: { phone: data.phone } });
                if (phoneExist)
                    throw new common_1.BadRequestException('Phone number already registered');
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(data.password || 'password123', salt);
            user = await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword,
                    role: 'MERCHANT',
                    status: 'ACTIVE',
                    merchantId,
                    referralCode: `STAF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
                }
            });
        }
        const existingMember = await this.prisma.merchantMember.findFirst({
            where: { merchantId, userId: user.id }
        });
        if (existingMember)
            throw new common_1.BadRequestException('User is already a team member of this merchant');
        return this.prisma.merchantMember.create({
            data: {
                merchantId,
                userId: user.id,
                role: data.role || 'STAFF',
                permissions: data.permissions || [],
            }
        });
    }
    async updateTeamMember(merchantId, id, data) {
        const member = await this.prisma.merchantMember.findFirst({ where: { id, merchantId } });
        if (!member)
            throw new common_1.NotFoundException('Team member not found');
        return this.prisma.merchantMember.update({
            where: { id },
            data: {
                role: data.role,
                permissions: data.permissions
            }
        });
    }
    async removeTeamMember(merchantId, id) {
        const member = await this.prisma.merchantMember.findFirst({ where: { id, merchantId } });
        if (!member)
            throw new common_1.NotFoundException('Team member not found');
        return this.prisma.merchantMember.delete({ where: { id } });
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamService);
//# sourceMappingURL=team.service.js.map