import jwt from 'jsonwebtoken';

// Signs an access token with user credentials and role information
export function signAccessToken(user_id, role_id, role_name) {
  return jwt.sign(
    { user_id, role_id, role_name, type: "access_token" },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Signs a refresh token with user ID and token version for session management
export function signRefreshToken(user_id, token_version) {
  return jwt.sign(
    { user_id, token_version, type: "refresh_token" },
    process.env.REFRESH_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Signs an email verification token for account activation
export function signEmailVerificationToken(user_id) {
  return jwt.sign(
    { user_id, type: "email_verification" },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: "1h" }
  );
}

// Signs a password reset token for secure password changes
export function signPasswordResetToken(user_id) {
  return jwt.sign(
    { user_id, type: "password_reset" },
    process.env.PASSWORD_RESET_SECRET,
    { expiresIn: "15m" }
  );
}

