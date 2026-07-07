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

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-[18px] w-[18px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-[18px] w-[18px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M10.6 5.64A10.7 10.7 0 0 1 12 5.5c6.5 0 9.5 6.5 9.5 6.5a13.3 13.3 0 0 1-3.15 3.9M6.6 6.6C4 8.3 2.5 12 2.5 12S5.5 18.5 12 18.5c1.3 0 2.44-.24 3.43-.63"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.9 10.1a2.75 2.75 0 0 0 3.9 3.9"
      />
    </svg>
  );
}

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const { t, messages } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const showLabel = t("login.showPassword");
  const hideLabel = t("login.hidePassword");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("resetPassword.newPassword")}
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 pe-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((current) => !current)}
            title={showNewPassword ? hideLabel : showLabel}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <span className="sr-only">
              {showNewPassword ? hideLabel : showLabel}
            </span>
            {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("resetPassword.confirmPassword")}
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmNewPassword")}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 pe-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            title={showConfirmPassword ? hideLabel : showLabel}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <span className="sr-only">
              {showConfirmPassword ? hideLabel : showLabel}
            </span>
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.confirmNewPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("resetPassword.resetting") : t("resetPassword.reset")}
      </button>
    </form>
  );
}
