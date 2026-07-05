"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/auth/auth.schema";
import { changePasswordRequest } from "@/lib/api/auth.api";

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setSuccessMessage("Password changed successfully.");
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
        <label className="block text-sm font-medium mb-1">
          Current password
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

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
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
