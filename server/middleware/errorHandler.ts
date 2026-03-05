import { Request, Response, NextFunction } from 'express';
import { respondWithError } from '../utils/responses.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack);
  respondWithError(res, err);
}
