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
