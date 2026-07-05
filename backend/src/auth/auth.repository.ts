import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { User, RefreshToken } from '../../generated/prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Users ----------

  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  updateEmail(userId: string, newEmail: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  }

  isEmailTaken(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // ---------- Password reset ----------
  setResetPasswordToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    });
  }

  findUserByValidResetToken(tokenHash: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { gt: new Date() },
      },
    });
  }

  clearResetPasswordToken(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetPasswordTokenHash: null, resetPasswordExpiresAt: null },
    });
  }

  // ---------- Refresh tokens ----------
  createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  // Only returns a token that is unexpired AND not revoked — used to
  // validate an incoming refresh token on every /auth/refresh call.
  findValidRefreshToken(
    tokenHash: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  }

  revokeRefreshToken(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  // Called on logout-all-devices, and on password change (kicks out every
  // other active session as soon as the password changes).
  revokeAllRefreshTokensForUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
