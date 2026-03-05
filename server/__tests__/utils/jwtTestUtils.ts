import jwt from 'jsonwebtoken';
import { signAccessToken } from '../../utils/index.js';

// Test utility functions for creating expired/invalid tokens
export function signExpiredEmailVerificationToken(user_id: number): string {
  const expiredPayload = {
    user_id,
    type: "email_verification",
    iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600  // 1 hour ago (expired)
  };
  return jwt.sign(expiredPayload, process.env.EMAIL_VERIFICATION_SECRET!);
}

export function signExpiredPasswordResetToken(user_id: number): string {
  const expiredPayload = {
    user_id,
    type: "password_reset",
    iat: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    exp: Math.floor(Date.now() / 1000) - 900   // 15 minutes ago (expired)
  };
  return jwt.sign(expiredPayload, process.env.PASSWORD_RESET_SECRET!);
}

// Create expired access token for testing
export function signExpiredAccessToken(user_id: number, role_id: number, role_name: string): string {
  const expiredPayload = {
    user_id,
    role_id,
    role_name,
    type: "access_token",
    iat: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    exp: Math.floor(Date.now() / 1000) - 900   // 15 minutes ago (expired)
  };
  return jwt.sign(expiredPayload, process.env.ACCESS_JWT_SECRET!);
}

// Create token with wrong secret for testing
export function signTokenWithWrongSecret(user_id: number, role_id: number, role_name: string): string {
  return jwt.sign(
    { user_id, role_id, role_name, type: "access_token" },
    'wrong-secret-key',
    { expiresIn: '15m' }
  );
}

// Create token with wrong type for testing
export function signWrongTypeToken(user_id: number, wrongType: string, secret: string): string {
  return jwt.sign(
    { user_id, type: wrongType },
    secret,
    { expiresIn: "1h" }
  );
}
