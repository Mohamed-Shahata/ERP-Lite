"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  getCompanySettingsRequest,
  updateCompanySettingsRequest,
} from "@/lib/api/company-settings.api";
import type { CompanySettings } from "@/types/company-settings.types";
import { resolveAssetUrl } from "@/lib/api/client";
import { useTranslations } from "@/lib/i18n/use-translations";

const CURRENCIES = ["EGP", "USD", "EUR", "SAR", "AED"];

const inputClass =
  "h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";
const textareaClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15V4M8 8l4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
      />
    </svg>
  );
}

export default function CompanySettingsPage() {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    currency: "EGP",
    address: "",
    taxNumber: "",
    invoicePrefix: "",
    invoiceFooterNote: "",
    paymentTerms: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applySettings(settings: CompanySettings) {
    setForm({
      name: settings.name,
      currency: settings.currency,
      address: settings.address,
      taxNumber: settings.taxNumber ?? "",
      invoicePrefix: settings.invoicePrefix ?? "",
      invoiceFooterNote: settings.invoiceFooterNote ?? "",
      paymentTerms: settings.paymentTerms ?? "",
    });
    setLogoPreview(resolveAssetUrl(settings.logoUrl));
  }

  const queryClient = useQueryClient();
  const { data: settingsData, error: loadError } = useQuery({
    queryKey: ["company-settings"],
    queryFn: getCompanySettingsRequest,
  });

  useEffect(() => {
    if (settingsData) applySettings(settingsData);
    if (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("settings.company.loadError"),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsData, loadError]);

  function handleLogoChange(file: File | null) {
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await updateCompanySettingsRequest({
        ...form,
        logo: logoFile,
      });
      queryClient.setQueryData(["company-settings"], updated);
      applySettings(updated);
      setLogoFile(null);
      setMessage(t("settings.company.savedSuccess"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("settings.company.saveError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {t("common.dashboardHome")}
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href="/settings"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {t("common.settings")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("settings.company.title")}
        </span>
      </p>

      <section>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          {t("settings.company.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("settings.company.description")}
        </p>
      </section>

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
              : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
      >
        {/* Logo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("settings.company.logo")}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400">
                  {t("settings.company.noLogo")}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                handleLogoChange(event.target.files?.[0] ?? null)
              }
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <UploadIcon />
              {t("settings.company.uploadLogo")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("settings.company.name")}
            </label>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("settings.company.currency")}
            </label>
            <select
              className={inputClass}
              value={form.currency}
              onChange={(e) =>
                setForm((c) => ({ ...c, currency: e.target.value }))
              }
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("settings.company.address")}
          </label>
          <textarea
            className={textareaClass}
            rows={2}
            required
            value={form.address}
            onChange={(e) =>
              setForm((c) => ({ ...c, address: e.target.value }))
            }
          />
        </div>

        {/* Invoice details */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            {t("settings.company.invoiceDetails")}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("settings.company.taxNumber")}
              </label>
              <input
                className={inputClass}
                value={form.taxNumber}
                onChange={(e) =>
                  setForm((c) => ({ ...c, taxNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("settings.company.invoicePrefix")}
              </label>
              <input
                className={inputClass}
                placeholder="INV-"
                value={form.invoicePrefix}
                onChange={(e) =>
                  setForm((c) => ({ ...c, invoicePrefix: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("settings.company.paymentTerms")}
              </label>
              <input
                className={inputClass}
                value={form.paymentTerms}
                onChange={(e) =>
                  setForm((c) => ({ ...c, paymentTerms: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("settings.company.invoiceFooterNote")}
              </label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.invoiceFooterNote}
                onChange={(e) =>
                  setForm((c) => ({ ...c, invoiceFooterNote: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {t("common.save")}
        </button>
      </form>
    </div>
  );
}
