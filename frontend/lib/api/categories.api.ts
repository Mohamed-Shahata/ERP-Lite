import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type { Category } from "@/types/product.types";

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

export async function listCategoriesRequest() {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories");
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
