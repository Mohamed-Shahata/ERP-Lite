import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type {
  CompanySettings,
  UpdateCompanySettingsPayload,
} from "@/types/company-settings.types";

export async function getCompanySettingsRequest() {
  const { data } =
    await apiClient.get<ApiResponse<CompanySettings>>("/company-settings");
  return data.data;
}

export async function updateCompanySettingsRequest(
  payload: UpdateCompanySettingsPayload,
) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("currency", payload.currency);
  formData.append("address", payload.address);
  if (payload.taxNumber) formData.append("taxNumber", payload.taxNumber);
  if (payload.invoicePrefix)
    formData.append("invoicePrefix", payload.invoicePrefix);
  if (payload.invoiceFooterNote)
    formData.append("invoiceFooterNote", payload.invoiceFooterNote);
  if (payload.paymentTerms)
    formData.append("paymentTerms", payload.paymentTerms);
  if (payload.logo) formData.append("logo", payload.logo);

  const { data } = await apiClient.patch<ApiResponse<CompanySettings>>(
    "/company-settings",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}
