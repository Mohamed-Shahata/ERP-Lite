import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <p className="text-sm font-medium text-emerald-700">Welcome back</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        Sign in to ERP Lite
      </h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">
        Use your company account to continue.
      </p>
      <LoginForm />
    </>
  );
}
