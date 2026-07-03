import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Usage: @UseGuards(JwtAuthGuard) on a controller or a single route.
 * Delegates to the 'jwt' Passport strategy (see strategies/jwt.strategy.ts).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
