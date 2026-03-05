import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../types/database.js';
import { UnauthorizedError, BadRequestError, ForbiddenError } from '../utils/errors.js';

type RoleCheckFunction = (role_id: number) => boolean;

function createRoleMiddleware(roleCheckFunc: RoleCheckFunction) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError("No access token provided");
    }
    const token = authHeader.split(' ')[1];

    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET!) as AccessTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Access token expired");
      }
      throw new BadRequestError("Invalid access token");
    }

    if (!roleCheckFunc(decoded.role_id)) {
      throw new ForbiddenError("Access denied");
    }

    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
      role_name: decoded.role_name,
    };

    next();
  };
}

export const verifyUserJWT = createRoleMiddleware((role_id) => role_id >= 1);
export const verifyEmployeeJWT = createRoleMiddleware((role_id) => role_id >= 2);
export const verifyAdminJWT = createRoleMiddleware((role_id) => role_id === 3);
