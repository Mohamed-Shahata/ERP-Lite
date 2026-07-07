import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type {
  SalesOrderDetail,
  SalesOrderListItem,
  SalesOrderStatus,
} from "@/types/sales-order.types";

export interface SalesOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderPayload {
  customerId: string;
  items: SalesOrderItemPayload[];
}

export interface UpdateSalesOrderPayload {
  customerId?: string;
  items?: SalesOrderItemPayload[];
}

export interface SalesOrderListParams extends PaginationParams {
  status?: SalesOrderStatus;
}

export async function listSalesOrdersRequest(
  params: SalesOrderListParams = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<SalesOrderListItem>>
  >("/sales-orders", { params });
  return data.data;
}

export async function getSalesOrderRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<SalesOrderDetail>>(
    `/sales-orders/${id}`,
  );
  return data.data;
}

export async function createSalesOrderRequest(
  payload: CreateSalesOrderPayload,
) {
  const { data } = await apiClient.post<ApiResponse<SalesOrderDetail>>(
    "/sales-orders",
    payload,
  );
  return data.data;
}

export async function updateSalesOrderRequest(
  id: string,
  payload: UpdateSalesOrderPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<SalesOrderDetail>>(
    `/sales-orders/${id}`,
    payload,
  );
  return data.data;
}

export async function cancelSalesOrderRequest(id: string) {
  const { data } = await apiClient.patch<ApiResponse<SalesOrderDetail>>(
    `/sales-orders/${id}/cancel`,
  );
  return data.data;
}

export async function deleteSalesOrderRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<SalesOrderDetail>>(
    `/sales-orders/${id}`,
  );
  return data.data;
}

export async function confirmSalesOrderRequest(id: string) {
  const { data } = await apiClient.post<ApiResponse<SalesOrderDetail>>(
    `/sales-orders/${id}/confirm`,
  );
  return data.data;
}
