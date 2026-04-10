import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException(
        'Akses ditolak: User tidak teridentifikasi.',
      );
    }

    // SUPER_ADMIN has god mode
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // For ADMIN_STAFF, we check their specific permissions array
    if (user.role === Role.ADMIN_STAFF) {
      const userPermissions = Array.isArray(user.adminPermissions)
        ? user.adminPermissions
        : [];

      // Require checking if the staff has ANY of the required permissions
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Akses ditolak: Membutuhkan izin [${requiredPermissions.join(' / ')}]`,
        );
      }
      return true;
    }

    // If other roles try to access something that has @Permissions, we deny access.
    throw new ForbiddenException(
      `Akses ditolak: Izin tidak memadai untuk role ini.`,
    );
  }
}
