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

export async function listStockMovementsRequest(
  params: StockMovementListParams = {},
) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<StockMovement>>
  >("/stock-movements", { params });
  return data.data;
}
