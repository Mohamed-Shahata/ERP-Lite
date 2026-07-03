import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { MailService } from '../common/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '../config/configuration';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    // Same error for "no such user" and "wrong password" — don't reveal
    // which emails exist in the system.
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

    const accessToken = this.signAccessToken(user.id, user.email, user.role);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
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

    return { message: 'Password changed successfully' };
  }

  /**
   * Always returns the same generic message whether or not the email exists,
   * so this endpoint can't be used to enumerate valid accounts.
   * The actual email is only sent if a matching, active user is found.
   */
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

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Admin-only — enforced at the controller level via @Roles('ADMIN').
   * No email notification is sent for this action (by design — see MailService).
   */
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

  private signAccessToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>(ConfigKeys.JWT_SECRET),
        expiresIn: this.configService.get<StringValue>(
          ConfigKeys.JWT_EXPIRES_IN,
        ),
      },
    );
  }

  private hashToken(rawToken: string): string {
    // Reset tokens are hashed with plain SHA-256 (not bcrypt) — they're
    // high-entropy random bytes already, not user-chosen passwords, so a
    // fast deterministic hash is fine and lets us query by exact match.
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }
}
