import { AuthLayoutPanel } from "@/components/auth/AuthLayoutPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutPanel>{children}</AuthLayoutPanel>;
}
