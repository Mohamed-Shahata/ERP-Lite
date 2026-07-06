"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createChangeEmailSchema,
  type ChangeEmailFormValues,
} from "@/lib/auth/auth.schema";
import { changeEmailRequest } from "@/lib/api/auth.api";
import { useTranslations } from "@/lib/i18n/use-translations";

export function ChangeEmailForm() {
  const { t, messages } = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeEmailSchema = useMemo(
    () => createChangeEmailSchema(messages.validation),
    [messages.validation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit = async (values: ChangeEmailFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await changeEmailRequest(values);
      setSuccessMessage("Email updated successfully.");
      reset();
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">User ID</label>
        <input
          type="text"
          {...register("userId")}
          placeholder="uuid of the user"
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.userId && (
          <p className="text-sm text-red-600 mt-1">{errors.userId.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("common.email")}
        </label>
        <input
          type="email"
          {...register("newEmail")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.newEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.newEmail.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        {isSubmitting ? "Updating…" : "Update email"}
      </button>

      <p className="text-xs text-gray-500">
        No email notification is sent to the user for this change (by design).
      </p>
    </form>
  );
}
