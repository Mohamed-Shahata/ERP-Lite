"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/auth/auth.schema";
import { forgotPasswordRequest } from "@/lib/api/auth.api";
import { useTranslations } from "@/lib/i18n/use-translations";

export function ForgotPasswordForm() {
  const { t, messages } = useTranslations();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(messages.validation),
    [messages.validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await forgotPasswordRequest(values.email);
      setSuccessMessage(result.message);
    } catch {
      setSuccessMessage(t("forgotPassword.successFallback"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("common.email")}
        </label>
        <input
          type="email"
          {...register("email")}
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          placeholder={t("login.emailPlaceholder")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
      </button>
    </form>
  );
}
