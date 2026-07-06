import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type { Supplier } from "@/types/supplier.types";

export interface CreateSupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function listSuppliersRequest(params: PaginationParams = {}) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<Supplier>>
  >("/suppliers", { params });
  return data.data;
}

export async function createSupplierRequest(payload: CreateSupplierPayload) {
  const { data } = await apiClient.post<ApiResponse<Supplier>>(
    "/suppliers",
    payload,
  );
  return data.data;
}

export async function updateSupplierRequest(
  supplierId: string,
  payload: UpdateSupplierPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Supplier>>(
    `/suppliers/${supplierId}`,
    payload,
  );
  return data.data;
}

export async function deleteSupplierRequest(supplierId: string) {
  const { data } = await apiClient.delete<ApiResponse<Supplier>>(
    `/suppliers/${supplierId}`,
  );
  return data.data;
}
