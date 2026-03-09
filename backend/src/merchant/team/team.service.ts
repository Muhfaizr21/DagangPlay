import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) { }

    async getTeamMembers(merchantId: string) {
        return this.prisma.merchantMember.findMany({
            where: { merchantId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
    }

    async addTeamMember(merchantId: string, data: any) {
        // Find if user already exists
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });

        if (!user) {
            // Check phone uniqueness
            if (data.phone) {
                const phoneExist = await this.prisma.user.findUnique({ where: { phone: data.phone } });
                if (phoneExist) throw new BadRequestException('Phone number already registered');
            }

            // Create new user with STAFF role
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
                    merchantId // Optional: staff belongs to a merchant
                }
            });
        }

        // Check if already a member
        const existingMember = await this.prisma.merchantMember.findFirst({
            where: { merchantId, userId: user.id }
        });

        if (existingMember) throw new BadRequestException('User is already a team member of this merchant');

        return this.prisma.merchantMember.create({
            data: {
                merchantId,
                userId: user.id,
                role: data.role || 'STAFF', // ADMIN or STAFF
                permissions: data.permissions || [], // e.g. ['MANAGE_PRODUCTS', 'MANAGE_ORDERS']
            }
        });
    }

    async updateTeamMember(merchantId: string, id: string, data: any) {
        const member = await this.prisma.merchantMember.findFirst({ where: { id, merchantId } });
        if (!member) throw new NotFoundException('Team member not found');

        return this.prisma.merchantMember.update({
            where: { id },
            data: {
                role: data.role,
                permissions: data.permissions
            }
        });
    }

    async removeTeamMember(merchantId: string, id: string) {
        const member = await this.prisma.merchantMember.findFirst({ where: { id, merchantId } });
        if (!member) throw new NotFoundException('Team member not found');

        return this.prisma.merchantMember.delete({ where: { id } });
    }
}
