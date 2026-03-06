import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        role_id: number;
        role_name: string;
      };
    }
  }
}

export {};
