import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

interface CustomResponse<T> {
  message: string;
  data: T;
}

function isCustomResponse<T>(value: unknown): value is CustomResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'data' in value
  );
}

/**
 * Wraps every successful controller response in one consistent envelope:
 * { success, statusCode, message, data }
 *
 * A controller can still override the default message by returning
 * { message: '...', data: ... } instead of just the raw payload.
 * Registered globally in main.ts, so no per-controller wiring is needed.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const statusCode = context
      .switchToHttp()
      .getResponse<Response>().statusCode;

    return next.handle().pipe(
      map((payload: T | CustomResponse<T>) => {
        if (isCustomResponse(payload)) {
          return {
            success: true,
            statusCode,
            message: payload.message,
            data: payload.data,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Request successful',
          data: payload,
        };
      }),
    );
  }
}
