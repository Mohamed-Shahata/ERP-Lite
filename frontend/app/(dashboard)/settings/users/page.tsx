"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

  return (
    <div className="max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {t("users.adminSettings")}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              {t("users.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("users.summary", {
                total: users.length,
                active: activeUsersCount,
              })}
            </p>
          </div>
          <button
            onClick={() => void loadUsers()}
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            type="button"
          >
            {t("common.refresh")}
          </button>
        </div>
      </section>

      {(message || error) && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
              : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">
          {t("users.createUser")}
        </h3>
        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_160px_140px_auto]"
        >
          <input
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder={t("common.name")}
            required
            value={form.name}
          />
          <input
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder={t("common.email")}
            required
            type="email"
            value={form.email}
          />
          <input
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
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
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
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
            className="h-10 rounded-md bg-slate-950 dark:bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
            disabled={isSaving}
            type="submit"
          >
            {t("common.create")}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              value={editForm.name}
                            />
                            <input
                              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
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
                              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
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
                          <div>
                            <p className="font-medium text-slate-950 dark:text-white">
                              {user.name}
                            </p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
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
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {user.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </span>
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
                                className="h-9 rounded-md bg-slate-950 dark:bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-700"
                                disabled={isSaving}
                                onClick={() => void handleUpdate(user.id)}
                                type="button"
                              >
                                {t("common.save")}
                              </button>
                              <button
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setEditingId(null)}
                                type="button"
                              >
                                {t("common.cancel")}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => startEdit(user)}
                                type="button"
                              >
                                {t("common.edit")}
                              </button>
                              <button
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                                disabled={isSaving}
                                onClick={() => void handleActiveChange(user)}
                                type="button"
                              >
                                {user.isActive
                                  ? t("users.deactivate")
                                  : t("users.activate")}
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
