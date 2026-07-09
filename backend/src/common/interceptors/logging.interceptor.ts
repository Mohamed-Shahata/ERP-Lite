import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';

/**
 * Logs every request once it finishes: method, path, status code, duration,
 * and the acting user (if authenticated). Registered globally in main.ts.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & Partial<AuthenticatedRequest>>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.log(method, originalUrl, request, start),
        error: () => this.log(method, originalUrl, request, start),
      }),
    );
  }

  private log(
    method: string,
    url: string,
    request: Request & Partial<AuthenticatedRequest>,
    start: number,
  ) {
    const duration = Date.now() - start;
    const userId = request.user?.id ?? 'anonymous';
    const status = context_status(request);
    this.logger.log(`${method} ${url} ${status} ${duration}ms user=${userId}`);
  }
}

function context_status(request: Request): number | string {
  return request.res?.statusCode ?? '-';
}
