export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between border-r border-white/10 bg-slate-900 px-10 py-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950">
            EL
          </div>
          <div>
            <p className="text-sm font-semibold">ERP Lite</p>
            <p className="text-xs text-slate-400">Secure operations hub</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-medium text-emerald-300">
            Finance, inventory, sales, and purchasing in one focused workspace.
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Run daily business workflows with clarity and control.
          </h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Role gated", "HttpOnly cookies", "Audit ready"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Backend-enforced auth with protected dashboard routing.
        </p>
      </section>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/20">
          {children}
        </div>
      </main>
    </div>
  );
}
