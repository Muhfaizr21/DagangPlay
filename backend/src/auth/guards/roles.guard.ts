import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            throw new ForbiddenException('Akses ditolak: User tidak teridentifikasi.');
        }

        const hasRole = requiredRoles.some((role) => user.role === role);
        if (!hasRole) {
            throw new ForbiddenException(`Akses ditolak: Membutuhkan role ${requiredRoles.join(' atau ')}`);
        }

        // --- Demo Account Mutation Protection ---
        const req = context.switchToHttp().getRequest();
        if (user.email === 'demo@dagangplay.com') {
            const method = req.method.toUpperCase();
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                // Allow explicit login/logout so demo user can login
                if (req.url.includes('/auth/login') || req.url.includes('/auth/logout')) {
                    return true;
                }
                throw new ForbiddenException('Aksi dinonaktifkan di mode Demo');
            }
        }

        return true;
    }
}
