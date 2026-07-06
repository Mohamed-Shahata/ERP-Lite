import { z } from "zod";
import type { Messages } from "@/lib/i18n/types";

export function createLoginSchema(v: Messages["validation"]) {
  return z.object({
    email: z.string().email(v.emailInvalid),
    password: z.string().min(8, v.passwordMin),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function createChangePasswordSchema(v: Messages["validation"]) {
  return z
    .object({
      currentPassword: z.string().min(1, v.currentPasswordRequired),
      newPassword: z.string().min(8, v.newPasswordMin),
      confirmNewPassword: z.string().min(1, v.confirmPasswordRequired),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: v.passwordsDontMatch,
      path: ["confirmNewPassword"],
    });
}

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export function createForgotPasswordSchema(v: Messages["validation"]) {
  return z.object({
    email: z.string().email(v.emailInvalid),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export function createResetPasswordSchema(v: Messages["validation"]) {
  return z
    .object({
      newPassword: z.string().min(8, v.passwordMin),
      confirmNewPassword: z.string().min(1, v.confirmPasswordRequired),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: v.passwordsDontMatch,
      path: ["confirmNewPassword"],
    });
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

export function createChangeEmailSchema(v: Messages["validation"]) {
  return z.object({
    userId: z.string().uuid(v.userIdInvalid),
    newEmail: z.string().email(v.emailInvalid),
  });
}

export type ChangeEmailFormValues = z.infer<
  ReturnType<typeof createChangeEmailSchema>
>;
