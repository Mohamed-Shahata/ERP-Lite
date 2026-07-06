"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/auth/auth.schema";
import { resetPasswordRequest } from "@/lib/api/auth.api";
import { useTranslations } from "@/lib/i18n/use-translations";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const { t, messages } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(messages.validation),
    [messages.validation],
  );

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
      <p className="text-sm text-red-600 dark:text-red-400">
        {t("resetPassword.missingToken")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("resetPassword.newPassword")}
        </label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("resetPassword.confirmPassword")}
        </label>
        <input
          type="password"
          {...register("confirmNewPassword")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-950 py-2 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
      >
        {isSubmitting ? t("resetPassword.resetting") : t("resetPassword.reset")}
      </button>
    </form>
  );
}
