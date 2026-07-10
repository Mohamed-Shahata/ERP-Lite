import Link from "next/link";

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4 rtl:rotate-180"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 2.5 19.5h19L12 3.5Z"
      />
      <path strokeLinecap="round" d="M12 9.5v5M12 17h.01" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4.5h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" d="M4 7h16M7 11h6M7 14h4" />
      <path strokeLinecap="round" d="M16.5 14.5h2M16.5 17h2" />
    </svg>
  );
}

function AlertBanner({
  href,
  title,
  description,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "danger" | "warning";
}) {
  const styles =
    tone === "danger"
      ? {
          container:
            "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50",
          icon: "text-red-700 dark:text-red-400",
          button:
            "bg-red-700 text-white hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-700",
          title: "text-red-900 dark:text-red-100",
          description: "text-red-700/80 dark:text-red-300/80",
        }
      : {
          container:
            "bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50",
          icon: "text-amber-800 dark:text-amber-400",
          button:
            "bg-amber-800 text-white hover:bg-amber-900 dark:bg-amber-900 dark:hover:bg-amber-800",
          title: "text-amber-950 dark:text-amber-100",
          description: "text-amber-800/80 dark:text-amber-300/80",
        };

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md sm:p-5 ${styles.container}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${styles.button}`}
      >
        <ArrowIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold sm:text-base ${styles.title}`}>
          {title}
        </p>
        <p
          className={`mt-1 text-xs leading-5 sm:text-sm ${styles.description}`}
        >
          {description}
        </p>
      </div>
      <span className={`shrink-0 ${styles.icon}`}>{icon}</span>
    </Link>
  );
}

export function DashboardAlertBanners({
  lowStockCount,
  overdueCount,
  singleOverdueInvoiceId,
  labels,
}: {
  lowStockCount: number;
  overdueCount: number;
  singleOverdueInvoiceId?: string;
  labels: {
    stockTitle: string;
    stockDescription: string;
    overdueTitle: string;
    overdueDescription: string;
  };
}) {
  if (lowStockCount === 0 && overdueCount === 0) {
    return null;
  }

  const overdueHref =
    overdueCount === 1 && singleOverdueInvoiceId
      ? `/invoices/${singleOverdueInvoiceId}`
      : "/invoices?overdue=true";

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {lowStockCount > 0 && (
        <AlertBanner
          href="/products?stockFilter=low"
          title={labels.stockTitle}
          description={labels.stockDescription}
          icon={<WarningIcon />}
          tone="danger"
        />
      )}
      {overdueCount > 0 && (
        <AlertBanner
          href={overdueHref}
          title={labels.overdueTitle}
          description={labels.overdueDescription}
          icon={<InvoiceIcon />}
          tone="warning"
        />
      )}
    </section>
  );
}
