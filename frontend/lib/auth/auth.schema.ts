import { z } from "zod";

// Mirrors backend LoginDto
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// Mirrors backend ChangePasswordDto
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Mirrors backend ForgotPasswordDto
export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Mirrors backend ResetPasswordDto (token comes from the URL, not typed by the user)
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Mirrors backend ChangeEmailDto
export const changeEmailSchema = z.object({
  userId: z.string().uuid("Must be a valid user id"),
  newEmail: z.string().email("Enter a valid email"),
});
export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
