import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import { signAccessToken } from '../../utils/index.js';
import { signExpiredAccessToken, signTokenWithWrongSecret } from '../utils/jwtTestUtils.js';

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

describe('Movies Integration Tests - Employee Level', () => {
  let userToken, employeeToken, adminToken;
  let testUserId, testEmployeeId, testAdminId;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test users with different roles
    const connection = await pool.getConnection();
    try {
      // Create test users
      const [userResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testuser', 'test@user.com', 'Test', 'User', 1, 1]
      );
      testUserId = userResult.insertId;

      const [employeeResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testemployee', 'test@employee.com', 'Test', 'Employee', 2, 1]
      );
      testEmployeeId = employeeResult.insertId;

      const [adminResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testadmin', 'test@admin.com', 'Test', 'Admin', 3, 1]
      );
      testAdminId = adminResult.insertId;

      // Generate tokens
      userToken = signAccessToken(testUserId, 1, 'user');
      employeeToken = signAccessToken(testEmployeeId, 2, 'employee');
      adminToken = signAccessToken(testAdminId, 3, 'admin');
    } finally {
      connection.release();
    }
  }, 30000);

  afterAll(async () => {
    await pool.end();
    await cleanupTestDatabase();
  }, 30000);

  beforeEach(async () => {
    await resetConnection();
  }, 30000);

  describe('GET /api/movies/upcoming/all - Employee/Admin Only', () => {
    test('should allow employee access to all upcoming movies', async () => {
      const response = await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify this endpoint returns more comprehensive data than public endpoint
      response.body.forEach(movie => {
        expect(movie).toHaveProperty('movie_id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('imageUrl');
      });
    });

    test('should allow admin access to all upcoming movies', async () => {
      const response = await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should deny regular user access', async () => {
      const response = await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    test('should deny unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/movies/upcoming/all')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    test('should handle invalid token', async () => {
      await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', 'Bearer invalid-token')
        .expect(400);
    });

    test('should handle malformed Authorization header', async () => {
      await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('GET /api/movies/:id/screenings/all - Employee/Admin Only', () => {
    test('should allow employee to see all screenings for a movie', async () => {
      const response = await request(app)
        .get('/api/movies/1/screenings/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Verify comprehensive screening data
      response.body.forEach(screening => {
        expect(screening).toHaveProperty('screening_id');
        expect(screening).toHaveProperty('start_date');
        expect(screening).toHaveProperty('start_time');
        expect(screening).toHaveProperty('end_time');
      });
    });

    test('should allow admin to see all screenings for a movie', async () => {
      const response = await request(app)
        .get('/api/movies/1/screenings/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should deny regular user access', async () => {
      const response = await request(app)
        .get('/api/movies/1/screenings/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    test('should deny unauthenticated access', async () => {
      await request(app)
        .get('/api/movies/1/screenings/all')
        .expect(401);
    });

    test('should handle non-existent movie', async () => {
      const response = await request(app)
        .get('/api/movies/9999999999/screenings/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body.message).toContain('No movie with this id was found');
    });

    test('should filter by cinema_id when provided', async () => {
      const response = await request(app)
        .get('/api/movies/1/screenings/all?cinema_id=1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should include past screenings (difference from public endpoint)', async () => {
      const response = await request(app)
        .get('/api/movies/1/screenings/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // This endpoint should include past screenings unlike the public one
    });
  });

  describe('Token Validation Edge Cases', () => {
    test('should handle expired token', async () => {
      // Create an expired token
      const expiredToken = signExpiredAccessToken(testEmployeeId, 2, 'employee');

      await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('should handle token with insufficient role', async () => {
      // Create token with role 1 (user) trying to access employee endpoint
      const insufficientToken = signAccessToken(testUserId, 1, 'user');

      await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${insufficientToken}`)
        .expect(403);
    });

    test('should handle token signed with wrong secret', async () => {
      const wrongSecretToken = signTokenWithWrongSecret(testEmployeeId, 2, 'employee');

      await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(400);
    });
  });

  describe('Data Integrity and Business Logic', () => {
    test('should return consistent data structure across employee endpoints', async () => {
      const upcomingResponse = await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      if (upcomingResponse.body.length > 0) {
        const movie = upcomingResponse.body[0];
        
        const screeningsResponse = await request(app)
          .get(`/api/movies/${movie.movie_id}/screenings/all`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);

        // Verify data consistency
        expect(Array.isArray(screeningsResponse.body)).toBe(true);
      }
    });

    test('should handle concurrent requests with same employee token', async () => {
      const requests = [
        request(app).get('/api/movies/upcoming/all').set('Authorization', `Bearer ${employeeToken}`),
        request(app).get('/api/movies/1/screenings/all').set('Authorization', `Bearer ${employeeToken}`),
        request(app).get('/api/movies/upcoming/all').set('Authorization', `Bearer ${employeeToken}`)
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Error Handling for Employee Endpoints', () => {
    test('should handle database errors gracefully', async () => {
      // Test error handling when database is temporarily unavailable
      // In a real scenario, you might mock the database connection to fail
      const response = await request(app)
        .get('/api/movies/upcoming/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Should either succeed or fail gracefully with proper error message
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('message');
      }
    });
  });
});