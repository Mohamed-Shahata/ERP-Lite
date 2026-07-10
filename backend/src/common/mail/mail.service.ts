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
      secure:
        this.configService.get<string>(ConfigKeys.NODE_ENV) == 'development'
          ? false
          : true,
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset your password</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: Arial, Helvetica, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color:#2952e3; padding:28px 32px;">
                      <span style="color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:0.5px;">ERP SOLUTIONS</span>
                    </td>
                  </tr>

                  <!-- Icon -->
                  <tr>
                    <td style="padding:36px 32px 8px 32px;">
                      <div style="width:48px; height:48px; background-color:#eef1fb; border-radius:10px; text-align:center; line-height:48px; font-size:22px;">
                        &#128274;
                      </div>
                    </td>
                  </tr>

                  <!-- Title -->
                  <tr>
                    <td style="padding:16px 32px 0 32px;">
                      <h1 style="margin:0; font-size:24px; color:#111827; font-weight:bold;">Reset your password</h1>
                    </td>
                  </tr>

                  <!-- Description -->
                  <tr>
                    <td style="padding:12px 32px 0 32px;">
                      <p style="margin:0; font-size:15px; line-height:22px; color:#6b7280;">
                        We received a request to reset the password for your ERP Lite account. Click the button below to choose a new one.
                      </p>
                    </td>
                  </tr>

                  <!-- Button -->
                  <tr>
                    <td style="padding:28px 32px 8px 32px;">
                      <a href="${resetLink}" style="display:inline-block; background-color:#2952e3; color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold; padding:14px 26px; border-radius:8px;">
                        Reset password &rarr;
                      </a>
                    </td>
                  </tr>

                  <!-- Copy link -->
                  <tr>
                    <td style="padding:24px 32px 0 32px;">
                      <p style="margin:0; font-size:13px; color:#9ca3af;">Or copy and paste this link into your browser:</p>
                      <p style="margin:4px 0 0 0; font-size:13px; word-break:break-all;">
                        <a href="${resetLink}" style="color:#2952e3; text-decoration:none;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Expiry notice -->
                  <tr>
                    <td style="padding:24px 32px 32px 32px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border-radius:8px;">
                        <tr>
                          <td style="padding:14px 16px; font-size:13px; color:#4b5563;">
                            &#9203; This link expires in <strong>30 minutes</strong>. If you didn't request this, ignore this email.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #eef0f2; padding:20px 32px; text-align:center;">
                      <p style="margin:0; font-size:12px; color:#9ca3af;">© 2026 ERP Lite. All rights reserved.</p>
                      <p style="margin:4px 0 0 0; font-size:12px; color:#9ca3af;">This is an automated message, please don't reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
