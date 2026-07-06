"use client";

import { AuthPageHeader } from "@/components/auth/AuthPageHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export function ResetPasswordPageClient({ token }: { token: string }) {
  return (
    <>
      <AuthPageHeader
        titleKey="resetPassword.title"
        subtitleKey="resetPassword.subtitle"
      />
      <ResetPasswordForm token={token} />
    </>
  );
}
