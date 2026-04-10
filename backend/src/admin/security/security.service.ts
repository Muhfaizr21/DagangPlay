import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  // ===========================
  // FRAUD DETECTION
  // ===========================
  async getFraudDetections(riskLevel?: string) {
    return this.prisma.fraudDetection.findMany({
      where: riskLevel ? { riskLevel: riskLevel as any } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true, totalPrice: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async resolveFraud(id: string, resolvedBy: string) {
    const fraud = await this.prisma.fraudDetection.findUnique({
      where: { id },
    });
    if (!fraud) throw new NotFoundException('Fraud case not found');

    return this.prisma.fraudDetection.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }

  // ===========================
  // IP BLACKLIST
  // ===========================
  async getBlacklistedIps() {
    return this.prisma.iPBlacklist.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async blacklistIp(ipAddress: string, reason: string, blockedBy: string) {
    return this.prisma.iPBlacklist.upsert({
      where: { ipAddress },
      update: { reason, blockedBy, createdAt: new Date() },
      create: { ipAddress, reason, blockedBy },
    });
  }

  async removeBlacklist(id: string) {
    return this.prisma.iPBlacklist.delete({ where: { id } });
  }

  // ===========================
  // LOGIN ATTEMPTS / MONITORING
  // ===========================
  async getLoginAttempts(limit: number = 100) {
    return this.prisma.loginAttempt.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAuditLogs(startDate?: string, action?: string) {
    const whereObj: any = {};
    if (action) whereObj.action = action;
    if (startDate) {
      whereObj.createdAt = { gte: new Date(startDate) };
    }

    return this.prisma.auditLog.findMany({
      where: whereObj,
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
