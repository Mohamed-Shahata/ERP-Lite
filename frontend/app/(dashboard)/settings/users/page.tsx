"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createUserRequest,
  listUsersRequest,
  setUserActiveRequest,
  updateUserRequest,
  type CreateUserPayload,
} from "@/lib/api/users.api";
import type { Role, SystemUser } from "@/types/auth.types";
import { useTranslations } from "@/lib/i18n/use-translations";

const roles: Role[] = ["EMPLOYEE", "MANAGER", "ADMIN"];

const emptyCreateForm: CreateUserPayload = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
  isActive: true,
};

function RefreshIcon() {
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
        d="M3.5 12a8.5 8.5 0 0 1 14.5-6M20.5 12a8.5 8.5 0 0 1-14.5 6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 3v4h-4M6 21v-4h4"
      />
    </svg>
  );
}

function PencilIcon() {
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
        d="m16.5 4.5 3 3L7 20H4v-3L16.5 4.5Z"
      />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v7" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.3 6.3a7 7 0 1 0 9.4 0"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}

export default function UsersSettingsPage() {
  const { t, dateLocale } = useTranslations();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [form, setForm] = useState<CreateUserPayload>(emptyCreateForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: Role;
    password: string;
  }>({ name: "", email: "", role: "EMPLOYEE", password: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users],
  );

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await listUsersRequest());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("users.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const created = await createUserRequest({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setUsers((current) => [created, ...current]);
      setForm(emptyCreateForm);
      setMessage(t("users.createdSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("users.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(user: SystemUser) {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setMessage(null);
    setError(null);
  }

  async function handleUpdate(userId: string) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await updateUserRequest(userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      setUsers((current) =>
        current.map((user) => (user.id === userId ? updated : user)),
      );
      setEditingId(null);
      setMessage(t("users.updatedSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("users.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleActiveChange(user: SystemUser) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await setUserActiveRequest(user.id, !user.isActive);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updated : item)),
      );
      setMessage(
        updated.isActive ? t("users.activated") : t("users.deactivated"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("users.statusError"));
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";
  const smallInputClass =
    "h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

  return (
    <div className="max-w-6xl space-y-6">
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
          {t("users.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("users.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("users.summary", {
                total: users.length,
                active: activeUsersCount,
              })}
            </p>
          </div>
          <button
            onClick={() => void loadUsers()}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            type="button"
          >
            <RefreshIcon />
            {t("common.refresh")}
          </button>
        </div>
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

      {/* Create user */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">
          {t("users.createUser")}
        </h3>
        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_160px_auto]"
        >
          <input
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder={t("common.name")}
            required
            value={form.name}
          />
          <input
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder={t("common.email")}
            required
            type="email"
            value={form.email}
          />
          <input
            className={inputClass}
            minLength={8}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder={t("common.password")}
            required
            type="password"
            value={form.password}
          />
          <select
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as Role,
              }))
            }
            value={form.role}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            type="submit"
          >
            <PlusIcon />
            {t("common.create")}
          </button>
        </form>
      </section>

      {/* Users table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">
            {t("users.systemUsers")}
          </h3>
        </div>
        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("users.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("users.user")}</th>
                  <th className="px-5 py-3 font-semibold">{t("users.role")}</th>
                  <th className="px-5 py-3 font-semibold">
                    {t("common.status")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("users.created")}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {users.map((user) => {
                  const isEditing = editingId === user.id;

                  return (
                    <tr key={user.id} className="align-top">
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <div className="grid gap-2">
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              value={editForm.name}
                            />
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              type="email"
                              value={editForm.email}
                            />
                            <input
                              className={smallInputClass}
                              minLength={8}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  password: event.target.value,
                                }))
                              }
                              placeholder={t("users.newPassword")}
                              type="password"
                              value={editForm.password}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-medium text-slate-950 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            className={smallInputClass}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                role: event.target.value as Role,
                              }))
                            }
                            value={editForm.role}
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          active={user.isActive}
                          label={
                            user.isActive
                              ? t("common.active")
                              : t("common.inactive")
                          }
                        />
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString(
                          dateLocale,
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                                disabled={isSaving}
                                onClick={() => void handleUpdate(user.id)}
                                type="button"
                              >
                                {t("common.save")}
                              </button>
                              <button
                                className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setEditingId(null)}
                                type="button"
                              >
                                {t("common.cancel")}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                onClick={() => startEdit(user)}
                                type="button"
                                aria-label={t("common.edit")}
                              >
                                <PencilIcon />
                              </button>
                              <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50 ${
                                  user.isActive
                                    ? "border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    : "border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                }`}
                                disabled={isSaving}
                                onClick={() => void handleActiveChange(user)}
                                type="button"
                                aria-label={
                                  user.isActive
                                    ? t("users.deactivate")
                                    : t("users.activate")
                                }
                                title={
                                  user.isActive
                                    ? t("users.deactivate")
                                    : t("users.activate")
                                }
                              >
                                <PowerIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
