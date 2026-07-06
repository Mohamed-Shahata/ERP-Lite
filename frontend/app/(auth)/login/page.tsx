import { AuthPageHeader } from "@/components/auth/AuthPageHeader";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <AuthPageHeader
        eyebrowKey="login.welcome"
        titleKey="login.title"
        subtitleKey="login.subtitle"
      />
      <LoginForm />
    </>
  );
}
