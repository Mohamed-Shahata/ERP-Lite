import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthRepository } from '../auth.repository';
import { ACCESS_TOKEN_COOKIE } from '../../common/cookies/auth-cookies.util';
import { ConfigKeys } from '../../config/configuration';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function extractFromCookie(req: Request): string | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigKeys.JWT_SECRET)!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authRepository.findUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer exists or is inactive');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
