import { signPasswordResetToken } from './jwtTokens.js';

// Generates a password reset link (refactored from resetPasswordReqService)
export default function generatePasswordResetLink(user_id) {
  const resetToken = signPasswordResetToken(user_id);
  
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  return {
    link: resetLink,
    token: resetToken
  };
}