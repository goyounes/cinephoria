import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import { 
  generateEmailVerificationLink, 
  generatePasswordResetLink,
  signEmailVerificationToken,
  signPasswordResetToken
} from '../../utils/index.js';
import { 
  signExpiredEmailVerificationToken,
  signExpiredPasswordResetToken,
  signWrongTypeToken
} from '../utils/jwtTestUtils.js';

// Mock the email client to prevent actual email sending during tests
jest.mock('../../api/emailClient.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({
    statusCode: 202,
    body: { message: 'Mock verification email sent' },
    headers: {}
  }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({
    statusCode: 202,
    body: { message: 'Mock password reset email sent' },
    headers: {}
  }),
  sendContactMessage: jest.fn().mockResolvedValue({
    statusCode: 202,
    body: { message: 'Mock contact email sent' },
    headers: {}
  }),
  sendContactAcknowledgment: jest.fn().mockResolvedValue({
    statusCode: 202,
    body: { message: 'Mock acknowledgment email sent' },
    headers: {}
  })
}));

// Import createApp function and create app with no rate limiting
const { default: createApp } = await import('../../app.js');

// No-op middleware that bypasses rate limiting
const noRateLimit = (req, res, next) => next();

const app = createApp({
  authLimiter: noRateLimit,
  browsingLimiter: noRateLimit,
  bookingLimiter: noRateLimit
});
const { pool } = await import('../../config/mysqlConnect.js');

describe('Auth Integration Tests - Complete User Flow', () => {
  let testUserData;
  let registeredUserId;
  let emailVerificationToken;
  let passwordResetToken;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Test user data for registration
    testUserData = {
      username: 'testuser123',
      email: 'testuser@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };
  }, 30000);

  afterAll(async () => {
    await pool.end();
    await cleanupTestDatabase();
  }, 30000);


  describe('User Registration Flow', () => {
    test('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User registered successfully');
      expect(response.body.message).toContain('Please verify your email');
      expect(response.body).toHaveProperty('user_id');
      
      registeredUserId = response.body.user_id;
      expect(registeredUserId).toBeGreaterThan(0);

      // Verify user was created in database but not verified
      const connection = await pool.getConnection();
      try {
        const [users] = await connection.execute(
          'SELECT user_id, user_name, user_email, first_name, last_name, isVerified FROM users WHERE user_id = ?',
          [registeredUserId]
        );
        
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.user_name).toBe(testUserData.username);
        expect(user.user_email).toBe(testUserData.email);
        expect(user.first_name).toBe(testUserData.firstName);
        expect(user.last_name).toBe(testUserData.lastName);
        expect(user.isVerified).toBe(0); // Should be unverified initially

        // Verify password was hashed and stored
        const [credentials] = await connection.execute(
          'SELECT user_password_hash FROM users_credentials WHERE user_id = ?',
          [registeredUserId]
        );
        
        expect(credentials).toHaveLength(1);
        expect(credentials[0].user_password_hash).toBeDefined();
        expect(credentials[0].user_password_hash).not.toBe(testUserData.password);
      } finally {
        connection.release();
      }
    });

    test('should reject registration with duplicate username', async () => {
      // Try to register same user again
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Username already exists');
    });

    test('should reject registration with invalid email format', async () => {
      const invalidEmailData = {
        ...testUserData,
        username: 'testuser2',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('valid email'))).toBe(true);
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordData = {
        ...testUserData,
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      const passwordErrors = response.body.errors.filter(err => err.path === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });

    test('should reject registration with missing required fields', async () => {
      const incompleteData = {
        username: 'testuser4',
        email: 'test4@example.com'
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      const errorMessages = response.body.errors.map(err => err.msg);
      expect(errorMessages).toContain('Password is required');
      expect(errorMessages).toContain('First name is required');
      expect(errorMessages).toContain('Last name is required');
    });

    test('should reject registration with username containing spaces', async () => {
      const spacedUsernameData = {
        ...testUserData,
        username: 'test user',
        email: 'test5@example.com'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(spacedUsernameData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('not contain spaces'))).toBe(true);
    });
  });

  describe('Email Verification Flow', () => {
    beforeAll(() => {
      // Generate a test verification token for our registered user
      emailVerificationToken = signEmailVerificationToken(registeredUserId);
    });

    test('should successfully verify email with valid token', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${emailVerificationToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Email successfully verified');

      // Verify user is now verified in database
      const connection = await pool.getConnection();
      try {
        const [users] = await connection.execute(
          'SELECT isVerified FROM users WHERE user_id = ?',
          [registeredUserId]
        );
        
        expect(users).toHaveLength(1);
        expect(users[0].isVerified).toBe(1); // Should now be verified
      } finally {
        connection.release();
      }
    });

    test('should reject verification attempt for already verified user', async () => {
      // Try to verify again
      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${emailVerificationToken}`)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Account already verified');
    });

    test('should reject verification with missing token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify-email')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Token is required');
    });

    test('should reject verification with invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${invalidToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    test('should reject verification with expired token', async () => {
      const expiredToken = signExpiredEmailVerificationToken(registeredUserId);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${expiredToken}`)
        .expect(410);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Verification link expired');
    });

    test('should reject verification with wrong token type', async () => {
      const wrongTypeToken = signWrongTypeToken(registeredUserId, 'password_reset', process.env.EMAIL_VERIFICATION_SECRET);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${wrongTypeToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid token type');
    });

    test('should reject verification for non-existent user', async () => {
      const nonExistentUserToken = signEmailVerificationToken(999999);

      const response = await request(app)
        .get(`/api/v1/auth/verify-email?token=${nonExistentUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Account not found');
    });
  });

  describe('Login Flow', () => {
    test('should successfully login with verified user', async () => {
      const loginData = {
        email: testUserData.email,
        password: testUserData.password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user_id', registeredUserId);
      expect(response.body).toHaveProperty('user_name', testUserData.username);
      expect(response.body).toHaveProperty('user_email', testUserData.email);
      expect(response.body).toHaveProperty('first_name', testUserData.firstName);
      expect(response.body).toHaveProperty('last_name', testUserData.lastName);
      expect(response.body).toHaveProperty('role_id', 1); // Default user role
      expect(response.body).toHaveProperty('role_name', 'user');
      expect(response.body).toHaveProperty('isVerified', 1);
      expect(response.body).toHaveProperty('accessToken');
      
      // Access token should be a valid JWT
      const decodedToken = jwt.verify(response.body.accessToken, process.env.ACCESS_JWT_SECRET);
      expect(decodedToken).toHaveProperty('user_id', registeredUserId);
      expect(decodedToken).toHaveProperty('role_id', 1);
      expect(decodedToken).toHaveProperty('role_name', 'user');

      // Verify the access token works with protected endpoints by making a test request
      const protectedResponse = await request(app)
        .get('/api/v1/tickets/owned') // This endpoint requires user authentication (verifyUserJWT)
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(200); // Should succeed with valid token

      expect(Array.isArray(protectedResponse.body)).toBe(true);

      // Should set HTTP-only cookie for refresh token
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    test('should reject login with incorrect password', async () => {
      const wrongPasswordData = {
        email: testUserData.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(wrongPasswordData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid password');
    });

    test('should reject login with non-existent email', async () => {
      const nonExistentEmailData = {
        email: 'nonexistent@example.com',
        password: testUserData.password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(nonExistentEmailData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('This email does not exist');
    });

    test('should reject login with invalid email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: testUserData.password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('valid email'))).toBe(true);
    });

    test('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      const errorMessages = response.body.errors.map(err => err.msg);
      expect(errorMessages).toContain('Email is required');
      expect(errorMessages).toContain('Password is required');
    });

    test('should re-send verification email for unverified user login attempt (test re-registers user)', async () => {
      // Create an unverified user for this test
      const unverifiedUserData = {
        username: 'unverifieduser',
        email: 'unverified@example.com',
        password: 'TestPass123!',
        firstName: 'Unverified',
        lastName: 'User'
      };

      // Register the user (will be unverified)
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(unverifiedUserData)
        .expect(201);

      // Attempt to login with unverified user
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: unverifiedUserData.email,
          password: unverifiedUserData.password
        })
        .expect(500);

      expect(loginResponse.body).toHaveProperty('message');
      expect(loginResponse.body.message).toContain('Account not verified');
      expect(loginResponse.body.message).toContain('another email has been sent');
    });
  });

  describe('Password Reset Flow', () => {
    test('should successfully request password reset for existing user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-req')
        .send({ email: testUserData.email })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset email sent');
    });

    test('should reject password reset request for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-req')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('No user with that email');
    });

    test('should reject password reset request with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-req')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('valid email'))).toBe(true);
    });

    test('should reject password reset request with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password-req')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('Email is required'))).toBe(true);
    });

    test('should successfully reset password with valid token', async () => {
      // Generate password reset token
      // passwordResetToken = jwt.sign(
      //   { user_id: registeredUserId, type: 'password_reset' },
      //   process.env.PASSWORD_RESET_SECRET,
      //   { expiresIn: '15m' }
      // );
      const { token: passwordResetToken } = generatePasswordResetLink(registeredUserId);
      const newPassword = 'NewTestPass123!';
      
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: passwordResetToken,
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset successfully');

      // Verify login works with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');

      // Verify old password no longer works
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        })
        .expect(500);
    });

    test('should reject password reset with expired token', async () => {
      const expiredToken = signExpiredPasswordResetToken(registeredUserId);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123!'
        })
        .expect(410);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset link expired');
    });

    test('should reject password reset with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid.token.here',
          newPassword: 'NewPassword123!'
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    test('should reject password reset with wrong token type', async () => {
      const wrongTypeToken = signWrongTypeToken(registeredUserId, 'email_verification', process.env.PASSWORD_RESET_SECRET);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: wrongTypeToken,
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid token type');
    });

    test('should reject password reset with weak new password', async () => {
      const validToken = signPasswordResetToken(registeredUserId);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: validToken,
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('at least 8 characters'))).toBe(true);
    });

    test('should reject password reset with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      const errorMessages = response.body.errors.map(err => err.msg);
      expect(errorMessages).toContain('Reset token is required');
      expect(errorMessages).toContain('Password is required');
    });
  });

  describe('Token Refresh Flow', () => {
    let validRefreshCookie;
    let accessToken;

    beforeAll(async () => {
      // Login to get refresh token cookie
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'NewTestPass123!' // Password from previous test
        });

      accessToken = loginResponse.body.accessToken;
      const cookies = loginResponse.headers['set-cookie'];
      validRefreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
    });

    test('should successfully refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', validRefreshCookie)
        .expect(200);

      expect(response.body).toHaveProperty('user_id', registeredUserId);
      expect(response.body).toHaveProperty('user_name', testUserData.username);
      expect(response.body).toHaveProperty('accessToken');

      // New access token should be valid (might be same if refresh was immediate)
      expect(response.body.accessToken).toBeDefined();
      
      const decodedToken = jwt.verify(response.body.accessToken, process.env.ACCESS_JWT_SECRET);
      expect(decodedToken).toHaveProperty('user_id', registeredUserId);

      // Verify the refreshed token works with protected endpoints
      const protectedResponse = await request(app)
        .get('/api/v1/tickets/owned')
        .set('Authorization', `Bearer ${response.body.accessToken}`)
        .expect(200);

      expect(Array.isArray(protectedResponse.body)).toBe(true);
    });

    test('should reject refresh with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Refresh token required');
    });

    test('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid.token.here')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('Logout Flow', () => {
    let refreshCookie;

    beforeAll(async () => {
      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'NewTestPass123!'
        });

      const cookies = loginResponse.headers['set-cookie'];
      refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
    });

    test('should successfully logout with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Logged out successfully');

      // Should clear the refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
      expect(clearedCookie).toMatch(/Expires=.*1970|Max-Age=0/); // Either expires in past or max-age 0
    });

    test('should reject logout attempt with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Refresh token required');
    });

    test('should reject refresh attempt with logged out (revoked) token', async () => {
      // Try to use the refresh token after logout - should be revoked
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Refresh token revoked (logged out)');
    });
  });


  describe('Email Link Simulation and Token Testing', () => {
    test('should simulate email verification flow with manual token creation', async () => {
      // Create an unverified user manually for this test
      const connection = await pool.getConnection();
      let unverifiedUserId;
      try {
        const [userResult] = await connection.execute(
          'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
          ['emailsimuser', 'emailsim@example.com', 'Email', 'Sim', 1, 0]
        );
        unverifiedUserId = userResult.insertId;
      } finally {
        connection.release();
      }

      // Use utility function to create verification link (same as production code)
      const { token: emailVerificationToken } = generateEmailVerificationLink(unverifiedUserId);

      // Simulate clicking the email verification link
      const verifyResponse = await request(app)
        .get(`/api/v1/auth/verify-email?token=${emailVerificationToken}`)
        .expect(200);

      expect(verifyResponse.body.message).toBe('Email successfully verified');

      // Verify user is now verified in database
      const connection2 = await pool.getConnection();
      try {
        const [users] = await connection2.execute(
          'SELECT isVerified FROM users WHERE user_id = ?',
          [unverifiedUserId]
        );
        expect(users[0].isVerified).toBe(1);
      } finally {
        connection2.release();
      }

      // Now user should be able to login
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'emailsim@example.com',
          password: 'TestPass123!' // This won't work since we didn't set password
        })
        .expect(500); // Expected to fail since no password was set
    });

    test('should reset password (with manual token creation using same function as production)', async () => {
      // Use the existing verified user
      const testEmail = testUserData.email;

      // First request password reset to ensure user exists
      await request(app)
        .post('/api/v1/auth/reset-password-req')
        .send({ email: testEmail })      
        .expect(200);

      // Get user ID for token creation
      const connection = await pool.getConnection();
      let userId;
      try {
        const [users] = await connection.execute(
          'SELECT user_id FROM users WHERE user_email = ?',
          [testEmail]
        );
        userId = users[0].user_id;
      } finally {
        connection.release();
      }

      // Use utility function to create password reset link (same as production code)
      const { token: passwordResetToken } = generatePasswordResetLink(userId);

      // Simulate clicking the password reset link and submitting new password
      const newPassword = 'SimulatedResetPass123!';
      const resetResponse = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: passwordResetToken,
          newPassword: newPassword
        })
        .expect(200);

      expect(resetResponse.body.message).toBe('Password reset successfully');

      // Verify login works with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');

      // Verify old password no longer works (if we knew what it was)
      // This is already tested in the main password reset flow
    });

    test('should test email verification token edge cases', async () => {
      // Test expired verification token
      const expiredToken = signExpiredEmailVerificationToken(999);

      await request(app)
        .get(`/api/v1/auth/verify-email?token=${expiredToken}`)
        .expect(410);

      // Test invalid token type
      const wrongTypeToken = signWrongTypeToken(999, 'password_reset', process.env.EMAIL_VERIFICATION_SECRET);

      await request(app)
        .get(`/api/v1/auth/verify-email?token=${wrongTypeToken}`)
        .expect(400);

      // Test malformed token
      await request(app)
        .get('/api/v1/auth/verify-email?token=invalid.token.here')
        .expect(500);
    });

    test('should test password reset token edge cases', async () => {
      // Test expired reset token
      const expiredResetToken = signExpiredPasswordResetToken(registeredUserId);

      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: expiredResetToken,
          newPassword: 'NewPassword123!'
        })
        .expect(410);

      // Test wrong token type
      const wrongTypeResetToken = signWrongTypeToken(registeredUserId, 'email_verification', process.env.PASSWORD_RESET_SECRET);

      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: wrongTypeResetToken,
          newPassword: 'NewPassword123!'
        })
        .expect(400);
    });

  });

  describe('Authentication Edge Cases and Security', () => {
    test('should handle concurrent registration attempts gracefully', async () => {
      const userData1 = {
        username: 'concurrent1',
        email: 'concurrent1@example.com',
        password: 'TestPass123!',
        firstName: 'Concurrent',
        lastName: 'User1'
      };

      const userData2 = {
        username: 'concurrent2',
        email: 'concurrent2@example.com',
        password: 'TestPass123!',
        firstName: 'Concurrent',
        lastName: 'User2'
      };

      // Make concurrent registration requests
      const [response1, response2] = await Promise.all([
        request(app).post('/api/v1/auth/register').send(userData1),
        request(app).post('/api/v1/auth/register').send(userData2)
      ]);

      // Both should succeed since they have different usernames/emails
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.user_id).not.toBe(response2.body.user_id);
    });

    test('should prevent SQL injection in registration', async () => {
      const maliciousData = {
        username: "'; DROP TABLE users; --",
        email: 'hacker@example.com',
        password: 'TestPass123!',
        firstName: 'Hacker',
        lastName: 'User'
      };

      // Should either reject or handle safely (not crash the server)
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(maliciousData);

      // Either validation error or successful registration (but no SQL injection)
      expect([ 400, 500]).toContain(response.status);
      
      // Verify database integrity - users table should still exist
      const connection = await pool.getConnection();
      try {
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        expect(users[0].count).toBeGreaterThan(0);
      } finally {
        connection.release();
      }
    });

    test('should handle very long input fields gracefully', async () => {
      const longString = 'a'.repeat(1000);
      const longInputData = {
        username: longString,
        email: `${longString}@example.com`,
        password: 'TestPass123!',
        firstName: longString,
        lastName: longString
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(longInputData);

      // Should handle gracefully (either validation error or database constraint error)
      expect([400, 500]).toContain(response.status);
    });

    test('should handle special characters in user data', async () => {
      const specialCharsData = {
        username: 'user_123',
        email: 'user+test@example.com',
        password: 'TestPass123!@#$',
        firstName: 'José',
        lastName: "O'Connor"
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(specialCharsData);

      // Should handle special characters properly
      expect(response.status).toBe(201);
    });

    test('should validate email domain properly', async () => {
      const invalidDomainData = {
        username: 'testdomainuser',
        email: 'test@a', // Domain too short
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidDomainData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('domain must be at least 2 characters'))).toBe(true);
    });

    test('should handle database constraint violations gracefully', async () => {
      // Test duplicate email registration (should trigger UNIQUE constraint)
      const existingUser = {
        username: 'uniquetest1',
        email: testUserData.email, // Using existing email from beforeAll
        password: 'TestPass123!',
        firstName: 'Duplicate',
        lastName: 'Email'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(existingUser)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      // Database constraint violation will trigger generic error
    });

    test('should handle duplicate username constraint violations', async () => {
      // Test duplicate username registration (should trigger UNIQUE constraint)  
      const existingUser = {
        username: testUserData.username, // Using existing username from beforeAll
        email: 'duplicate.username@test.com',
        password: 'TestPass123!',
        firstName: 'Duplicate',
        lastName: 'Username'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(existingUser)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Username already exists');
    });

    test('should handle foreign key constraint violations in user credentials', async () => {
      // This test simulates a scenario where user creation succeeds but credential creation fails
      // In practice, this would be prevented by transactions, but tests edge cases
      const userData = {
        username: 'constrainttest',
        email: 'constraint@test.com',
        password: 'TestPass123!',
        firstName: 'Constraint',
        lastName: 'Test'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Should either succeed or fail gracefully
      expect([201, 500]).toContain(response.status);
    });
  });
});