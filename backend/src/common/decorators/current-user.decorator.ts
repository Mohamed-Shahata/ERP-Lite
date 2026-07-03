import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from '../interfaces/current-user.interface';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: CurrentUserPayload;
};

/**
 * Usage: login(@CurrentUser() user: CurrentUserPayload)
 * Relies on JwtAuthGuard having already attached `user` to the request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
