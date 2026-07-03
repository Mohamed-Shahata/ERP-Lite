import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { User } from '../../generated/prisma/client';

/**
 * Repository layer: raw Prisma queries only, no business rules here.
 * auth.service.ts decides WHAT to do; auth.repository.ts decides HOW to
 * talk to the database. Keeps the service testable without mocking Prisma directly.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      data: {
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });
  }

  isEmailTaken(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
