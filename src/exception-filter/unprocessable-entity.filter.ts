import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: 'Unprocessable Entity',
      errors: exception.getResponse(),
    });
  }
}
