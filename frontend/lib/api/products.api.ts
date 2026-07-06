import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type { Product } from "@/types/product.types";

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  sellPrice: number;
  quantityInStock?: number;
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
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export async function listProductsRequest() {
  const { data } = await apiClient.get<ApiResponse<Product[]>>("/products");
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
