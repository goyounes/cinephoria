import { Request } from 'express';
import { NotFoundError } from './errors.js';

/**
 * Parse and validate ID from route params
 * @throws NotFoundError if ID is invalid
 */
export function parseIdParam(req: Request, resourceName: string = 'Resource'): number {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    throw new NotFoundError(`${resourceName} not found`);
  }

  return parsedId;
}

/**
 * Parse optional cinema_id from query params
 * Returns null if invalid or missing
 */
export function parseCinemaIdQuery(req: Request): number | null {
  if (!req.query.cinema_id) return null;

  const cinemaId = Array.isArray(req.query.cinema_id)
    ? req.query.cinema_id[0]
    : req.query.cinema_id;

  if (typeof cinemaId !== 'string') return null;

  const parsedId = parseInt(cinemaId, 10);
  return isNaN(parsedId) ? null : parsedId;
}
