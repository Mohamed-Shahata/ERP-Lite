import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type {
  MovementType,
  ReferenceType,
  StockMovement,
} from "@/types/stock-movement.types";

export interface StockMovementListParams extends PaginationParams {
  productId?: string;
  type?: MovementType;
  referenceType?: ReferenceType;
  from?: string;
  to?: string;
}

export interface CreateAdjustmentPayload {
  productId: string;
  // Signed delta: positive increases stock, negative decreases it.
  quantity: number;
  note?: string;
}

export async function listStockMovementsRequest(
  params: StockMovementListParams = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<StockMovement>>
  >("/stock-movements", { params });
  return data.data;
}

export async function createStockAdjustmentRequest(
  payload: CreateAdjustmentPayload,
) {
  const { data } = await apiClient.post<ApiResponse<StockMovement>>(
    "/stock-movements/adjustments",
    payload,
  );
  return data.data;
}
