"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/auth/auth.schema";
import { resetPasswordRequest } from "@/lib/api/auth.api";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await resetPasswordRequest({ token, newPassword: values.newPassword });
      router.push("/login?reset=success");
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-red-600">
        This reset link is missing its token. Please request a new one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">New password</label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Confirm new password
        </label>
        <input
          type="password"
          {...register("confirmNewPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.confirmNewPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 text-white py-2 disabled:opacity-50"
      >
        {isSubmitting ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
