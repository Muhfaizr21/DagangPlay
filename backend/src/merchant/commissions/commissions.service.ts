import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async getCommissions(merchantId: string) {
    // Fetch all pending commissions for this merchant's resellers
    const resellerCommissions = await this.prisma.commission.groupBy({
      by: ['userId'],
      where: {
        status: 'PENDING',
        order: { merchantId },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Add user details
    const details = await Promise.all(
      resellerCommissions.map(async (rc) => {
        const user = await this.prisma.user.findUnique({
          where: { id: rc.userId },
          select: { name: true, email: true },
        });
        return {
          userId: rc.userId,
          name: user?.name,
          email: user?.email,
          totalPendingAmount: rc._sum?.amount || 0,
          totalOrders: (rc._count as any)?.id || 0,
        };
      }),
    );

    const totalPending = details.reduce(
      (sum, d) => sum + Number(d.totalPendingAmount || 0),
      0,
    );

    return {
      totalPending,
      resellerCommissions: details,
    };
  }

  async settleCommissions(merchantId: string, resellerId?: string) {
    // In this method, the Merchant marks the commissions as settled
    // and optionally adds to Reseller's balance

    const whereClause: any = {
      status: 'PENDING',
      order: { merchantId },
    };

    if (resellerId) {
      whereClause.userId = resellerId;
    }

    const commissions = await this.prisma.commission.findMany({
      where: whereClause,
      include: { user: true },
    });

    if (commissions.length === 0)
      return { success: false, message: 'Tidak ada komisi pending' };

    await this.prisma.$transaction(async (tx) => {
      // Group by userId to handle balance additions efficiently
      const userAmounts: { [userId: string]: number } = {};
      for (const c of commissions) {
        userAmounts[c.userId] = (userAmounts[c.userId] || 0) + Number(c.amount);
      }

      // Update balance and create transaction records
      for (const [uid, amount] of Object.entries(userAmounts)) {
        await tx.user.update({
          where: { id: uid },
          data: { balance: { increment: amount } },
        });

        await tx.balanceTransaction.create({
          data: {
            userId: uid,
            type: 'COMMISSION_PAYMENT',
            amount: amount,
            description: 'Settlement Komisi',
          },
        });
      }

      // Mark commissions as settled
      await tx.commission.updateMany({
        where: whereClause,
        data: {
          status: 'SETTLED',
          settledAt: new Date(),
        },
      });
    });

    return {
      success: true,
      count: commissions.length,
      message: 'Komisi berhasil dicairkan ke saldo reseller',
    };
  }
}
