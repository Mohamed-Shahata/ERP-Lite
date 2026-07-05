import { ChangeEmailForm } from "@/components/auth/ChangeEmailForm";

export default function UsersSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700">Admin settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          User email management
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Admin-only action protected by middleware and enforced again by the
          backend RolesGuard.
        </p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <ChangeEmailForm />
      </section>
    </div>
  );
}
