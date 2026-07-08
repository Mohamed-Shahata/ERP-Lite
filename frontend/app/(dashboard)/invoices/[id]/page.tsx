"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceRequest } from "@/lib/api/invoices.api";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";
import { useTranslations } from "@/lib/i18n/use-translations";

interface InvoiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { t } = useTranslations();
  const { id } = use(params);

  const {
    data: invoice,
    error,
    isPending,
  } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceRequest(id),
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          {error instanceof Error
            ? error.message
            : t("invoices.loadDetailError")}
        </p>
      </div>
    );
  }

  if (isPending || !invoice) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {t("invoices.notFound")}
        </p>
      </div>
    );
  }

  return <InvoiceDetailView invoice={invoice} />;
}
