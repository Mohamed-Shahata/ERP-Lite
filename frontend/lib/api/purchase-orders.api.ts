import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type {
  PurchaseOrderDetail,
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from "@/types/purchase-order.types";

export interface PurchaseOrderItemPayload {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  items: PurchaseOrderItemPayload[];
}

export interface UpdatePurchaseOrderPayload {
  supplierId?: string;
  items?: PurchaseOrderItemPayload[];
}

export interface PurchaseOrderListParams extends PaginationParams {
  status?: PurchaseOrderStatus;
}

export async function listPurchaseOrdersRequest(
  params: PurchaseOrderListParams = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<PurchaseOrderListItem>>
  >("/purchase-orders", { params });
  return data.data;
}

export async function getPurchaseOrderRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<PurchaseOrderDetail>>(
    `/purchase-orders/${id}`,
  );
  return data.data;
}

export async function createPurchaseOrderRequest(
  payload: CreatePurchaseOrderPayload,
) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDetail>>(
    "/purchase-orders",
    payload,
  );
  return data.data;
}

export async function updatePurchaseOrderRequest(
  id: string,
  payload: UpdatePurchaseOrderPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<PurchaseOrderDetail>>(
    `/purchase-orders/${id}`,
    payload,
  );
  return data.data;
}

// Sets status -> CANCELLED. Backend only allows this while still PENDING.
export async function cancelPurchaseOrderRequest(id: string) {
  const { data } = await apiClient.patch<ApiResponse<PurchaseOrderDetail>>(
    `/purchase-orders/${id}/cancel`,
  );
  return data.data;
}

// Backend only allows this while still PENDING.
export async function deletePurchaseOrderRequest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<PurchaseOrderDetail>>(
    `/purchase-orders/${id}`,
  );
  return data.data;
}

// The business operation: status -> RECEIVED, stock incremented,
// StockMovement recorded. Not a plain PATCH — see backend for why.
export async function receivePurchaseOrderRequest(id: string) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrderDetail>>(
    `/purchase-orders/${id}/receive`,
  );
  return data.data;
}
