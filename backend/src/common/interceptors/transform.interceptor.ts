import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = (request as any).id || (request.headers['x-request-id'] as string);

    return next.handle().pipe(
      map((data) => {
        // If the handler already returned an ApiResponse-like structure with success flag
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
            requestId: requestId || data.requestId,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
