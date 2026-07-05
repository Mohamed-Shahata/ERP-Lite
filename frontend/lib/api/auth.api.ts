import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type { AuthUser } from "@/types/auth.types";
import type {
  LoginFormValues,
  ChangeEmailFormValues,
} from "@/lib/auth/auth.schema";

interface AuthResponseData {
  user: AuthUser;
}

// POST /auth/login — tokens arrive as httpOnly cookies, not in this body.
export async function loginRequest(payload: LoginFormValues) {
  const { data } = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/login",
    payload,
  );
  return data.data.user;
}

// POST /auth/logout — revokes the refresh token server-side and clears cookies.
export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}

// PATCH /auth/change-password
export async function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const { data } = await apiClient.patch<ApiResponse<{ message: string }>>(
    "/auth/change-password",
    payload,
  );
  return data.data;
}

// POST /auth/forgot-password
export async function forgotPasswordRequest(email: string) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forgot-password",
    { email },
  );
  return data.data;
}

// POST /auth/reset-password
export async function resetPasswordRequest(payload: {
  token: string;
  newPassword: string;
}) {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    payload,
  );
  return data.data;
}

// PATCH /auth/change-email  (ADMIN only — backend enforces via RolesGuard)
export async function changeEmailRequest(payload: ChangeEmailFormValues) {
  const { data } = await apiClient.patch<ApiResponse<{ message: string }>>(
    "/auth/change-email",
    payload,
  );
  return data.data;
}
