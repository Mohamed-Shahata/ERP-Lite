import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-950">
        Forgot your password?
      </h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
