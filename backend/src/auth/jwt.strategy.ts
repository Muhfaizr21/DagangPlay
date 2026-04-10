import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dagangplay_super_secret_key',
    });
  }

  async validate(payload: any) {
    // Validasi token berdasarkan session ID yang aktif (Revokasi session / Logout)
    if (payload.sessionId) {
      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sessionId },
      });
      if (!session) {
        throw new UnauthorizedException(
          'Sesi Anda telah berakhir atau Anda telah logout.',
        );
      }
    }

    // Validasi token ID di database jika diperlukan, atau cukup kembalikan payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Token tidak dikenali atau user telah dihapus',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Akun ini sedang dalam status tidak aktif / disuspend.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      merchantId: user.merchantId,
    };
  }
}
