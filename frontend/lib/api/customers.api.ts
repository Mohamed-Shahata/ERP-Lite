import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type { Customer } from "@/types/customer.types";

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function listCustomersRequest(params: PaginationParams = {}) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<Customer>>
  >("/customers", { params });
  return data.data;
}

export async function createCustomerRequest(payload: CreateCustomerPayload) {
  const { data } = await apiClient.post<ApiResponse<Customer>>(
    "/customers",
    payload,
  );
  return data.data;
}

export async function updateCustomerRequest(
  customerId: string,
  payload: UpdateCustomerPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Customer>>(
    `/customers/${customerId}`,
    payload,
  );
  return data.data;
}

export async function deleteCustomerRequest(customerId: string) {
  const { data } = await apiClient.delete<ApiResponse<Customer>>(
    `/customers/${customerId}`,
  );
  return data.data;
}
