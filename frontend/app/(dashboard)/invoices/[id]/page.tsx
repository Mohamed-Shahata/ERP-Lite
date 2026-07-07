"use client";

import { useEffect, useState } from "react";
import { getInvoiceRequest } from "@/lib/api/invoices.api";
import type { InvoiceDetail } from "@/types/invoice.types";
import { InvoiceDetailView } from "@/components/invoices/InvoiceDetailView";
import { useTranslations } from "@/lib/i18n/use-translations";

interface InvoiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { t } = useTranslations();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const data = await getInvoiceRequest(id);
        setInvoice(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("invoices.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block">
            <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400 animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          لم يتم العثور على الفاتورة
        </p>
      </div>
    );
  }

  return <InvoiceDetailView invoice={invoice} />;
}
