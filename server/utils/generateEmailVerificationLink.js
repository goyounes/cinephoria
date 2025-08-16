import jwt from 'jsonwebtoken';

// Generates an email verification link (refactored from registerService)
export default function generateEmailVerificationLink(user_id) {
  const emailVerificationToken = jwt.sign(
    { user_id, type: "email_verification" },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: "1h" }
  );
  
  const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
  
  return {
    link: verificationLink,
    token: emailVerificationToken
  };
}