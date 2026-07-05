// Path: src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { MailService } from '../common/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ConfigKeys } from '../config/configuration';
import { IUser } from '../common/interfaces/user.interface';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MINUTES = 30;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const ACCESS_TOKEN_TTL_MS = ACCESS_TOKEN_TTL_SECONDS * 1000;
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const REFRESH_TOKEN_TTL_MS =
  REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens & { user: IUser }> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Rotation: every time a refresh token is used, it's immediately revoked
   * and a brand new one is issued. If someone ever presents an already-used
   * (revoked) refresh token, that's a strong signal the token was stolen —
   * we revoke ALL of that user's sessions as a precaution.
   */
  async refreshTokens(
    rawRefreshToken: string | undefined,
  ): Promise<AuthTokens & { user: IUser }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.authRepository.findValidRefreshToken(tokenHash);

    if (!existing) {
      // Could be expired, already-rotated, or forged. We can't tell which
      // user it belonged to from a bad hash alone, so we just deny it.
      throw new UnauthorizedException(
        'Refresh token is invalid or has expired',
      );
    }

    await this.authRepository.revokeRefreshToken(existing.id);

    const { user } = existing;
    if (!user.isActive) {
      throw new UnauthorizedException('User is no longer active');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.authRepository.findValidRefreshToken(tokenHash);
    if (existing) {
      await this.authRepository.revokeRefreshToken(existing.id);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentPasswordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.authRepository.updatePassword(userId, newPasswordHash);

    // Force every other active session/device to log in again.
    await this.authRepository.revokeAllRefreshTokensForUser(userId);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    const genericResponse = {
      message: 'If that email exists, a reset link has been sent to it',
    };

    if (!user || !user.isActive) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    await this.authRepository.setResetPasswordToken(
      user.id,
      tokenHash,
      expiresAt,
    );
    await this.mailService.sendPasswordResetEmail(user.email, rawToken);

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const user = await this.authRepository.findUserByValidResetToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.authRepository.updatePassword(user.id, newPasswordHash);
    await this.authRepository.clearResetPasswordToken(user.id);

    // A password reset is a strong reason to also kill every existing session.
    await this.authRepository.revokeAllRefreshTokensForUser(user.id);

    return { message: 'Password has been reset successfully' };
  }

  async changeEmail(dto: ChangeEmailDto) {
    const targetUser = await this.authRepository.findUserById(dto.userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.authRepository.isEmailTaken(dto.newEmail);
    if (existing && existing.id !== dto.userId) {
      throw new ConflictException('This email is already in use');
    }

    await this.authRepository.updateEmail(dto.userId, dto.newEmail);
    return { message: 'Email updated successfully' };
  }

  // ---------- internal helpers ----------

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>(ConfigKeys.JWT_SECRET),
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    );

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.authRepository.createRefreshToken(
      userId,
      refreshTokenHash,
      expiresAt,
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }
}
