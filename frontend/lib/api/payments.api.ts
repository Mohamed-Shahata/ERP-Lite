import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api-response";
import type { InvoicePayment } from "@/types/invoice.types";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

export interface CreatePaymentPayload {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
}

export async function createPaymentRequest(payload: CreatePaymentPayload) {
  const { data } = await apiClient.post<ApiResponse<InvoicePayment>>(
    "/payments",
    payload,
  );
  return data.data;
}
