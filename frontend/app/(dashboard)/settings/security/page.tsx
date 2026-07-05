import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Security
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Update your password. Session tokens stay in httpOnly cookies and are
          refreshed by the backend.
        </p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <ChangePasswordForm />
      </section>
    </div>
  );
}
