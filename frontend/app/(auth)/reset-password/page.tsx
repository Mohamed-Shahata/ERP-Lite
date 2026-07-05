import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-950">
        Reset your password
      </h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">
        Choose a strong password for your ERP Lite account.
      </p>
      <ResetPasswordForm token={token ?? ""} />
    </>
  );
}
