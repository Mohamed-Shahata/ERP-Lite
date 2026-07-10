import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type {
  ContentPage,
  PageSlug,
  UpdateContentPagePayload,
} from "@/types/content-page.types";

// Public — used by the login screen and any signed-out page.
export async function listContentPagesRequest() {
  const { data } =
    await apiClient.get<ApiResponse<ContentPage[]>>("/content-pages");
  return data.data;
}

// Public — fetches (and lazily creates) a single page by slug.
export async function getContentPageRequest(slug: PageSlug | string) {
  const { data } = await apiClient.get<ApiResponse<ContentPage>>(
    `/content-pages/${slug}`,
  );
  return data.data;
}

// Admin only — enforced on the backend via RolesGuard.
export async function updateContentPageRequest(
  slug: PageSlug,
  payload: UpdateContentPagePayload,
) {
  const { data } = await apiClient.put<ApiResponse<ContentPage>>(
    `/content-pages/${slug}`,
    payload,
  );
  return data.data;
}
