import { signPasswordResetToken } from './jwtTokens.js';

interface PasswordResetResult {
  link: string;
  token: string;
}

// Generates a password reset link (refactored from resetPasswordReqService)
export default function generatePasswordResetLink(user_id: number): PasswordResetResult {
  const resetToken = signPasswordResetToken(user_id);

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  return {
    link: resetLink,
    token: resetToken
  };
}
