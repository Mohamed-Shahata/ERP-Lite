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

export function ChangePasswordForm() {
  const { t, messages } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("changePassword.currentPassword")}
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("changePassword.newPassword")}
        </label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("changePassword.confirmPassword")}
        </label>
        <input
          type="password"
          {...register("confirmNewPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? t("changePassword.saving") : t("changePassword.submit")}
      </button>
    </form>
  );
}
