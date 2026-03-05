import { Response } from 'express';
import { AppError, ValidationError } from './errors.js';

export function respondWithJson(res: Response, data: any, statusCode: number = 200): void {
  res.status(statusCode).json(data);
}

export function respondWithError(res: Response, error: Error): void {
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({ errors: error.errors });
    return;
  }

  // Check for status code in this order: AppError, .status, .statusCode, default 500
  let statusCode: number;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else {
    // Express errors (like SyntaxError from JSON parsing) have .status property
    statusCode = (error as any).status || (error as any).statusCode || 500;
  }

  const message = error.message || "Something broke in the web server!";

  res.status(statusCode).json({ message, status: statusCode });
}
