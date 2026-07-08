import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/lib/auth/auth-store";
import type { ApiErrorResponse } from "@/types/api-response";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Backend returns relative paths for uploaded files (e.g. "/uploads/logos/x.png").
// The browser must resolve these against the API origin, not the Next.js origin,
// or the image request 404s against the frontend server instead of the backend.
export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${path}`;
}

function normalizeError(error: AxiosError<ApiErrorResponse>): Error {
  const backendMessage = error.response?.data?.message;
  const message = Array.isArray(backendMessage)
    ? backendMessage.join(", ")
    : "Something went wrong. Please try again.";
  return new Error(message);
}

function goToLogin() {
  useAuthStore.getState().setUser(null);
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// /auth/refresh once per failed request.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh")
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as typeof error.config & {
      _retried?: boolean;
    };

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      originalRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;
      const refreshed = await tryRefresh();

      if (refreshed) {
        return apiClient(originalRequest);
      }

      goToLogin();
    }

    return Promise.reject(normalizeError(error));
  },
);
