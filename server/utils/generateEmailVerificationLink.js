import { signEmailVerificationToken } from './jwtTokens.js';

// Generates an email verification link (refactored from registerService)
export default function generateEmailVerificationLink(user_id) {
  const emailVerificationToken = signEmailVerificationToken(user_id);
  
  const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
  
  return {
    link: verificationLink,
    token: emailVerificationToken
  };
}