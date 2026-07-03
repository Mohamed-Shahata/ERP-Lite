import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ConfigKeys } from '../../config/configuration';

/**
 * Deliberately narrow: the ONLY email this app sends is the password-reset link.
 * No welcome emails, no notifications, nothing else — by design.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(ConfigKeys.SMTP_HOST),
      port: this.configService.get<number>(ConfigKeys.SMTP_PORT),
      secure: this.configService.get<boolean>(ConfigKeys.SMTP_SECURE),
      auth: {
        user: this.configService.get<string>(ConfigKeys.SMTP_USER),
        pass: this.configService.get<string>(ConfigKeys.SMTP_PASSWORD),
      },
    });
  }

  async sendPasswordResetEmail(
    toEmail: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(ConfigKeys.FRONTEND_URL);
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(ConfigKeys.SMTP_FROM),
        to: toEmail,
        subject: 'Reset your ERP Lite password',
        html: `
          <p>We received a request to reset your password.</p>
          <p><a href="${resetLink}">Click here to reset your password</a></p>
          <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
        `,
      });
    } catch (error) {
      // Don't throw — the auth.service must always respond with the same
      // generic success message regardless of whether the email actually
      // sent, otherwise we leak which emails exist in the system.
      this.logger.error(
        `Failed to send password reset email to ${toEmail}`,
        error,
      );
    }
  }
}
