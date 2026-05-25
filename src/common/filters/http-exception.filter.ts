// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
//Catches all HTTP errors globally and formats them into a uniform error response payload
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorDetails = typeof exceptionResponse === 'object' 
      ? exceptionResponse 
      : { message: exceptionResponse };

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request['id'] || 'N/A',
      ...errorDetails,
    };

    this.logger.error(`[${errorBody.requestId}] ${request.method} ${request.url} Error: ${JSON.stringify(errorDetails)}`);

    response.status(status).json(errorBody);
  }
}
