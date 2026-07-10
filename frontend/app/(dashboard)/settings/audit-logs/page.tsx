"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  listAuditLogsRequest,
  type AuditLogListParams,
} from "@/lib/api/audit-logs.api";
import { Pagination } from "@/components/ui/Pagination";
import type { AuditLog } from "@/types/audit-log.types";

const ACTION_KEYS: Record<string, string> = {
  SALES_ORDER_CREATED: "auditLogs.actions.salesOrderCreated",
  SALES_ORDER_CONFIRMED: "auditLogs.actions.salesOrderConfirmed",
  PURCHASE_ORDER_CREATED: "auditLogs.actions.purchaseOrderCreated",
  PURCHASE_ORDER_RECEIVED: "auditLogs.actions.purchaseOrderReceived",
  PAYMENT_RECORDED: "auditLogs.actions.paymentRecorded",
  PRODUCT_CREATED: "auditLogs.actions.productCreated",
  PRODUCT_UPDATED: "auditLogs.actions.productUpdated",
  PRODUCT_DELETED: "auditLogs.actions.productDeleted",
  COMPANY_SETTINGS_UPDATED: "auditLogs.actions.companySettingsUpdated",
  USER_CREATED: "auditLogs.actions.userCreated",
  USER_ROLE_CHANGED: "auditLogs.actions.userRoleChanged",
  USER_ACTIVATED: "auditLogs.actions.userActivated",
  USER_DEACTIVATED: "auditLogs.actions.userDeactivated",
  LOGIN: "auditLogs.actions.login",
  CREATE: "auditLogs.actions.create",
  UPDATE: "auditLogs.actions.update",
  DELETE: "auditLogs.actions.delete",
  RECORD_PAYMENT: "auditLogs.actions.recordPayment",
};

export default function AuditLogsPage() {
  const { t, dateLocale } = useTranslations();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    const params: AuditLogListParams = { page, limit: pageSize };
    if (action) params.action = action;
    if (entityType) params.entityType = entityType;
    if (from) params.from = from;
    if (to) params.to = to;
    listAuditLogsRequest(params)
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data);
        setTotal(res.meta.total);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : t("auditLogs.loadError"),
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, action, entityType, from, to]);

  const selectClass =
    "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <Link href="/settings" className="hover:underline">
          {t("settings.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("auditLogs.title")}
        </span>
      </p>

      <section>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          {t("auditLogs.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("auditLogs.description")}
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <select
          className={selectClass}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            resetPage();
          }}
        >
          <option value="">{t("auditLogs.filters.allActions")}</option>
          {Object.entries(ACTION_KEYS).map(([value, key]) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>

        <input
          className={selectClass}
          placeholder={t("auditLogs.filters.entityType")}
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            resetPage();
          }}
        />

        <input
          type="date"
          className={selectClass}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            resetPage();
          }}
        />
        <input
          type="date"
          className={selectClass}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            resetPage();
          }}
        />

        {(action || entityType || from || to) && (
          <button
            type="button"
            onClick={() => {
              setAction("");
              setEntityType("");
              setFrom("");
              setTo("");
              resetPage();
            }}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("auditLogs.filters.clear")}
          </button>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("auditLogs.loading")}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auditLogs.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("auditLogs.columns.action")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("auditLogs.columns.entity")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("auditLogs.columns.user")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("auditLogs.columns.date")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3 font-medium text-slate-950 dark:text-white">
                      {ACTION_KEYS[log.action]
                        ? t(ACTION_KEYS[log.action])
                        : log.action}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {log.user?.name ?? t("auditLogs.systemUser")}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString(dateLocale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={t("auditLogs.title")}
        />
      </section>
    </div>
  );
}
