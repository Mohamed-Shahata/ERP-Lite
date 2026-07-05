const metrics = [
  { label: "Open sales orders", value: "24", trend: "+12% this week" },
  { label: "Pending purchases", value: "8", trend: "3 need approval" },
  { label: "Low stock items", value: "15", trend: "Check inventory" },
  { label: "Unpaid invoices", value: "$18.4k", trend: "Due this month" },
];

const modules = [
  "Customers",
  "Suppliers",
  "Products",
  "Sales orders",
  "Purchase orders",
  "Invoices",
  "Payments",
  "Stock movements",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-emerald-700">Overview</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            A clean operating desk for your ERP data.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The backend currently exposes authentication endpoints. The
            business modules below match the Prisma ERP models and are ready for
            API-backed screens when those controllers are added.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {metric.value}
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {metric.trend}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              ERP modules
            </h2>
            <p className="text-sm text-slate-500">
              Structure prepared for the backend domain models.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <div
              key={module}
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {module}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
