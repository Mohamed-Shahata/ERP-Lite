import { AuthPageHeader } from "@/components/auth/AuthPageHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthPageHeader
        titleKey="forgotPassword.title"
        subtitleKey="forgotPassword.subtitle"
      />
      <ForgotPasswordForm />
    </>
  );
}
