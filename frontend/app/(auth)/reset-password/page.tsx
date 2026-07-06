import { ResetPasswordPageClient } from "./ResetPasswordPageClient";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return <ResetPasswordPageClient token={token ?? ""} />;
}
