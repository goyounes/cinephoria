import jwt from 'jsonwebtoken';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  EmailVerificationPayload,
  PasswordResetPayload
} from '../types/database.js';

// Signs an access token with user credentials and role information
export function signAccessToken(user_id: number, role_id: number, role_name: string): string {
  return jwt.sign(
    { user_id, role_id, role_name, type: "access_token" } as Omit<AccessTokenPayload, 'iat' | 'exp'>,
    process.env.ACCESS_JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

// Signs a refresh token with user ID and token version for session management
export function signRefreshToken(user_id: number, token_version: number): string {
  return jwt.sign(
    { user_id, token_version, type: "refresh_token" } as Omit<RefreshTokenPayload, 'iat' | 'exp'>,
    process.env.REFRESH_JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

// Signs an email verification token for account activation
export function signEmailVerificationToken(user_id: number): string {
  return jwt.sign(
    { user_id, type: "email_verification" } as Omit<EmailVerificationPayload, 'iat' | 'exp'>,
    process.env.EMAIL_VERIFICATION_SECRET!,
    { expiresIn: "1h" }
  );
}

// Signs a password reset token for secure password changes
export function signPasswordResetToken(user_id: number): string {
  return jwt.sign(
    { user_id, type: "password_reset" } as Omit<PasswordResetPayload, 'iat' | 'exp'>,
    process.env.PASSWORD_RESET_SECRET!,
    { expiresIn: "15m" }
  );
}
