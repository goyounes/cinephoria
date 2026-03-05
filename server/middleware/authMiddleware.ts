import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../types/database.js';

type RoleCheckFunction = (role_id: number) => boolean;

function createRoleMiddleware(roleCheckFunc: RoleCheckFunction) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "No access token provided" });
        return;
      }
      const token = authHeader.split(' ')[1];

      let decoded: AccessTokenPayload;
      try {
        decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET!) as AccessTokenPayload;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(401).json({ message: "Access token expired" });
          return;
        }
        res.status(400).json({ message: "Invalid access token" });
        return;
      }

      if (!roleCheckFunc(decoded.role_id)) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const verifyUserJWT = createRoleMiddleware((role_id) => role_id >= 1);
export const verifyEmployeeJWT = createRoleMiddleware((role_id) => role_id >= 2);
export const verifyAdminJWT = createRoleMiddleware((role_id) => role_id === 3);
