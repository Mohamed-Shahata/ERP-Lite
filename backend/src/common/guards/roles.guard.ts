import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../decorators/current-user.decorator';
import { Role } from '../../../generated/prisma/enums';

/**
 * Must run AFTER JwtAuthGuard (order matters in @UseGuards(JwtAuthGuard, RolesGuard)),
 * since it reads request.user which JwtAuthGuard is the one that sets.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles(...) decorator on this route → allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return requiredRoles.includes(user?.role);
  }
}
