// Mirrors the backend's global ResponseInterceptor + HttpExceptionFilter shapes.
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  path: string;
  timestamp: string;
  message: string[];
}

// Mirrors the backend's PaginatedResult<T> (see common/interfaces/paginated-result.interface.ts).
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
