import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  method: string;
  timestamp: string;
  errors?: string[];
}

/**
 * Prisma error codes that mean "the database could not be used", as opposed to
 * "the request was wrong". These become 503 so callers know to retry.
 */
const DATABASE_UNAVAILABLE_CODES = new Set([
  'P1000', // authentication failed
  'P1001', // can't reach database server
  'P1002', // database server timed out
  'P1003', // can't establish a connection
  'P1008', // operation timed out
  'P1010', // user was denied access
  'P1011', // TLS connection error
  'P1017', // server has closed the connection
]);

/**
 * Single place where every error becomes a predictable JSON payload.
 *
 * Handles the three sources of failure in this API:
 *  - `HttpException` and its subclasses (validation, auth, guards, filters)
 *  - Prisma known request errors, mapped to meaningful status codes
 *  - Anything unexpected, which is logged in full and reported as a generic
 *    500 so internals are never leaked to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const { status, message, error, errors } = this.resolve(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.originalUrl} -> ${status}: ${message}`);
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      error,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      body.errors = errors;
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    message: string;
    error: string;
    errors?: string[];
  } {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'The request payload is invalid.',
        error: 'Bad Request',
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'The database is currently unavailable. Please try again shortly.',
        error: 'Service Unavailable',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
      error: 'Internal Server Error',
    };
  }

  private fromHttpException(exception: HttpException): {
    status: number;
    message: string;
    error: string;
    errors?: string[];
  } {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { status, message: payload, error: exception.name };
    }

    const record = payload as { message?: string | string[]; error?: string };
    const rawMessage = record?.message;
    const errors = Array.isArray(rawMessage) ? rawMessage : undefined;
    const singleMessage = typeof rawMessage === 'string' ? rawMessage : undefined;

    return {
      status,
      message: errors
        ? 'The request contains invalid values.'
        : (singleMessage ?? exception.message),
      error: record?.error ?? exception.name,
      errors,
    };
  }

  private fromPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${this.describeUniqueTarget(exception)} already exists.`,
          error: 'Conflict',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The operation references a record that does not exist.',
          error: 'Bad Request',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
          error: 'Not Found',
        };
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The provided value is too long for this field.',
          error: 'Bad Request',
        };
      default:
        // Connection-level failures are the database being unavailable, not a
        // bad request, so the client should retry rather than give up.
        if (DATABASE_UNAVAILABLE_CODES.has(exception.code)) {
          return {
            status: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'The database is currently unavailable. Please try again shortly.',
            error: 'Service Unavailable',
          };
        }

        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'The database rejected the request.',
          error: 'Internal Server Error',
        };
    }
  }

  private describeUniqueTarget(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;
    if (Array.isArray(target)) return target.join(' + ');
    if (typeof target === 'string') return target;
    return 'value';
  }
}
