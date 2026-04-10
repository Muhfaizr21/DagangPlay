import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    // Mask sensitive details in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error for internal monitoring
    console.error(`[Error] ${request.method} ${request.url}`, {
      status,
      message,
      stack: isProduction ? undefined : (exception as Error).stack,
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'Something went wrong',
      ...(isProduction
        ? {}
        : { debug: exception instanceof Error ? exception.stack : exception }),
    });
  }
}
