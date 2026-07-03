import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Catches EVERY exception (HttpException and raw Error/Prisma errors alike)
 * and returns one consistent JSON shape, so the frontend never has to guess
 * the error format depending on which layer threw it.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? (exception.getResponse() as ExceptionResponse | string)
      : null;
    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = exceptionResponse?.message ?? 'Internal server error';
    }

    if (!isHttpException) {
      // Unexpected errors (DB down, bugs, etc.) — log full stack for debugging
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error(String(exception));
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: Array.isArray(message) ? message : [message],
    });
  }
}
