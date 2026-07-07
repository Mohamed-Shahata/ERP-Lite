"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/auth/auth.schema";
import { changePasswordRequest } from "@/lib/api/auth.api";
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

function PasswordField({
  id,
  label,
  register,
  error,
  visible,
  onToggleVisible,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  register: ReturnType<
    ReturnType<typeof useForm<ChangePasswordFormValues>>["register"]
  >;
  error?: string;
  visible: boolean;
  onToggleVisible: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          {...register}
          className="h-11 w-full rounded-xl border border-slate-300 px-3 pe-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          title={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <span className="sr-only">{visible ? hideLabel : showLabel}</span>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function ChangePasswordForm() {
  const { t, messages } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleFields, setVisibleFields] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const changePasswordSchema = useMemo(
    () => createChangePasswordSchema(messages.validation),
    [messages.validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await changePasswordRequest({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccessMessage(t("changePassword.success"));
      reset();
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLabel = t("login.showPassword");
  const hideLabel = t("login.hidePassword");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <PasswordField
        id="current-password"
        label={t("changePassword.currentPassword")}
        register={register("currentPassword")}
        error={errors.currentPassword?.message}
        visible={visibleFields.current}
        onToggleVisible={() =>
          setVisibleFields((current) => ({
            ...current,
            current: !current.current,
          }))
        }
        showLabel={showLabel}
        hideLabel={hideLabel}
      />

      <PasswordField
        id="new-password"
        label={t("changePassword.newPassword")}
        register={register("newPassword")}
        error={errors.newPassword?.message}
        visible={visibleFields.next}
        onToggleVisible={() =>
          setVisibleFields((current) => ({ ...current, next: !current.next }))
        }
        showLabel={showLabel}
        hideLabel={hideLabel}
      />

      <PasswordField
        id="confirm-password"
        label={t("changePassword.confirmPassword")}
        register={register("confirmNewPassword")}
        error={errors.confirmNewPassword?.message}
        visible={visibleFields.confirm}
        onToggleVisible={() =>
          setVisibleFields((current) => ({
            ...current,
            confirm: !current.confirm,
          }))
        }
        showLabel={showLabel}
        hideLabel={hideLabel}
      />

      {serverError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("changePassword.saving") : t("changePassword.submit")}
      </button>
    </form>
  );
}
