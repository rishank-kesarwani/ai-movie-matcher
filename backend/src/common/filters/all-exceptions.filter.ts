import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      (request as any).id ||
      'unknown-req-id';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected server error occurred. Please try again later.';
    let code = 'INTERNAL_SERVER_ERROR';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const respObj = exceptionResponse as Record<string, any>;
        message =
          Array.isArray(respObj.message)
            ? respObj.message.join(', ')
            : respObj.message || exception.message;

        errors = respObj.errors || (Array.isArray(respObj.message) ? respObj.message : undefined);
        code = respObj.error || this.mapStatusCodeToErrorCode(statusCode);
      }
      code = this.mapStatusCodeToErrorCode(statusCode);
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
      code = 'INTERNAL_SERVER_ERROR';
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      code,
      message,
      ...(errors ? { errors } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${statusCode} [${code}]: ${
          exception instanceof Error ? exception.stack : JSON.stringify(exception)
        }`,
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${statusCode} [${code}]: ${message}`,
      );
    }

    response.status(statusCode).json(errorResponse);
  }

  private mapStatusCodeToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'AUTHENTICATION_REQUIRED';
      case HttpStatus.FORBIDDEN:
        return 'PERMISSION_DENIED';
      case HttpStatus.NOT_FOUND:
        return 'RESOURCE_NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'RESOURCE_CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_FAILED';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'GATEWAY_TIMEOUT';
      default:
        return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR';
    }
  }
}
