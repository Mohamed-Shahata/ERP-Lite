import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type { Product } from "@/types/product.types";

export interface CreateProductPayload {
  quantityInStock: string | number | readonly string[] | undefined;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  sellPrice: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  costPrice?: number;
  sellPrice?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export async function listProductsRequest(params: PaginationParams = {}) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
    "/products",
    { params },
  );
  console.log(data);
  return data.data;
}

export async function createProductRequest(payload: CreateProductPayload) {
  const { data } = await apiClient.post<ApiResponse<Product>>(
    "/products",
    payload,
  );
  return data.data;
}

export async function updateProductRequest(
  productId: string,
  payload: UpdateProductPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Product>>(
    `/products/${productId}`,
    payload,
  );
  return data.data;
}

export async function deleteProductRequest(productId: string) {
  const { data } = await apiClient.delete<ApiResponse<Product>>(
    `/products/${productId}`,
  );
  return data.data;
}
