import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type {
  InvoiceDetail,
  InvoiceListItem,
  InvoiceStatus,
} from "@/types/invoice.types";

export interface InvoiceListParams extends PaginationParams {
  status?: InvoiceStatus;
}

export async function listInvoicesRequest(params: InvoiceListParams = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<InvoiceListItem>>
  >("/invoices", { params: cleanParams });
  return data.data;
}

export async function getInvoiceRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<InvoiceDetail>>(
    `/invoices/${id}`,
  );
  return data.data;
}

export async function getInvoiceByNumberRequest(invoiceNumber: string) {
  const { data } = await apiClient.get<ApiResponse<InvoiceDetail>>(
    `/invoices/number/${invoiceNumber}`,
  );
  return data.data;
}

export async function getInvoiceBySalesOrderRequest(salesOrderId: string) {
  const { data } = await apiClient.get<ApiResponse<InvoiceDetail>>(
    `/invoices/sales-order/${salesOrderId}`,
  );
  return data.data;
}
