import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type { Role, SystemUser } from "@/types/auth.types";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

export async function listUsersRequest() {
  const { data } = await apiClient.get<ApiResponse<SystemUser[]>>("/users");
  return data.data;
}

export async function createUserRequest(payload: CreateUserPayload) {
  const { data } = await apiClient.post<ApiResponse<SystemUser>>(
    "/users",
    payload,
  );
  return data.data;
}

export async function updateUserRequest(
  userId: string,
  payload: UpdateUserPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<SystemUser>>(
    `/users/${userId}`,
    payload,
  );
  return data.data;
}

export async function setUserActiveRequest(
  userId: string,
  isActive: boolean,
) {
  const { data } = await apiClient.patch<ApiResponse<SystemUser>>(
    `/users/${userId}/active`,
    { isActive },
  );
  return data.data;
}
