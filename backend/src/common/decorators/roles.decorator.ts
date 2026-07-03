import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Usage: @Roles('ADMIN', 'MANAGER')
 * Must be used together with RolesGuard.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
