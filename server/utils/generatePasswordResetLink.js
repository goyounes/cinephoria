import jwt from 'jsonwebtoken';

// Generates a password reset link (refactored from resetPasswordReqService)
export default function generatePasswordResetLink(user_id) {
  const resetToken = jwt.sign(
    { user_id, type: "password_reset" },
    process.env.PASSWORD_RESET_SECRET,
    { expiresIn: "15m" }
  );
  
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  return {
    link: resetLink,
    token: resetToken
  };
}