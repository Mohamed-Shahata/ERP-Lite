import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api-response";
import type { AuditLog } from "@/types/audit-log.types";

export interface AuditLogListParams extends PaginationParams {
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export async function listAuditLogsRequest(params: AuditLogListParams = {}) {
  const { data } = await apiClient.get<
    ApiResponse<PaginatedResponse<AuditLog>>
  >("/audit-logs", { params });
  return data.data;
}
