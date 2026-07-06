import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type { Category } from "@/types/product.types";

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

export async function listCategoriesRequest(params: PaginationParams = {}) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<Category>>
  >("/categories", { params });
  return data.data;
}

export async function createCategoryRequest(payload: CreateCategoryPayload) {
  const { data } = await apiClient.post<ApiResponse<Category>>(
    "/categories",
    payload,
  );
  return data.data;
}

export async function updateCategoryRequest(
  categoryId: string,
  payload: UpdateCategoryPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Category>>(
    `/categories/${categoryId}`,
    payload,
  );
  return data.data;
}

export async function deleteCategoryRequest(categoryId: string) {
  const { data } = await apiClient.delete<ApiResponse<Category>>(
    `/categories/${categoryId}`,
  );
  return data.data;
}
