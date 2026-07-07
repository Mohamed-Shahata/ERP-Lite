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
import Link from "next/link";

function ArrowIcon({ mirrored }: { mirrored: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={`h-4 w-4 ${mirrored ? "-scale-x-100" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ForgotPasswordForm() {
  const { t, messages, dir } = useTranslations();
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
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("common.email")}
        </label>
        <input
          type="email"
          {...register("email")}
          className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder={t("login.emailPlaceholder")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? t("forgotPassword.sending")
          : t("forgotPassword.sendLink")}
      </button>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowIcon mirrored={dir === "rtl"} />
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
