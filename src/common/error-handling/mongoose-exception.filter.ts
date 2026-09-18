import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import { MongooseError } from 'mongoose';

const validationCode = {
  uniqueValidationCode: 11000,
};

@Catch(MongooseError)
export class MongooseExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages = [exception.message];

    if (exception instanceof MongoServerError) {
      if (exception.code === validationCode.uniqueValidationCode) {
        status = HttpStatus.CONFLICT;
        messages = this._mapErrorToUniqueMessage(exception);
      } else {
        status = HttpStatus.BAD_REQUEST;
      }
    } else if (exception instanceof MongooseError) {
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      message: messages,
    });
  }

  private _mapErrorToUniqueMessage(error: MongoServerError) {
    const keys = error.keyValue || { error: 'Duplicate value exists' };
    const messages = Object.entries(keys)
      .map(([key, value]) => `${key}: value '${value}' is already taken`);
    return messages;
  }
}
