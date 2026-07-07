"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLoginSchema,
  type LoginFormValues,
} from "@/lib/auth/auth.schema";
import { loginRequest } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";

const REMEMBERED_EMAIL_KEY = "erp-lite-remembered-email";

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

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const { t, messages, dir } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginSchema = useMemo(
    () => createLoginSchema(messages.validation),
    [messages.validation],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Pre-fill the email if the user previously chose "remember me".
  // This runs once on mount to sync from an external system (localStorage),
  // not to recompute derived state, so a one-time setState here is intended.
  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setValue("email", remembered);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const user = await loginRequest(values);

      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("common.password")}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 pe-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder={t("login.passwordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            title={t(
              showPassword ? "login.hidePassword" : "login.showPassword",
            )}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <span className="sr-only">
              {t(showPassword ? "login.hidePassword" : "login.showPassword")}
            </span>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900"
        />
        {t("login.rememberMe")}
      </label>

      {serverError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("login.signingIn") : t("login.signIn")}
        {!isSubmitting && <ArrowIcon mirrored={dir === "rtl"} />}
      </button>
    </form>
  );
}
