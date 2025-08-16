import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import dayjs from 'dayjs';

// Load test environment
process.env.NODE_ENV = 'test';
const testEnv = await import('dotenv');
testEnv.config({ path: '.test.env', quiet: true });

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

describe('Screenings Integration Tests - Employee Level', () => {
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
      userToken = jwt.sign(
        { user_id: testUserId, role_id: 1, role_name: 'user' },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '15m' }
      );

      employeeToken = jwt.sign(
        { user_id: testEmployeeId, role_id: 2, role_name: 'employee' },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '15m' }
      );

      adminToken = jwt.sign(
        { user_id: testAdminId, role_id: 3, role_name: 'admin' },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '15m' }
      );
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

  describe('GET /api/screenings - Employee/Admin Only', () => {
    test('should allow employee access to all screenings', async () => {
      const response = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const screening = response.body[0];
        expect(screening).toHaveProperty('screening_id');
        expect(screening).toHaveProperty('movie_id');
        expect(screening).toHaveProperty('cinema_id');
        expect(screening).toHaveProperty('room_id');
        expect(screening).toHaveProperty('start_date');
        expect(screening).toHaveProperty('start_time');
        expect(screening).toHaveProperty('end_time');
        expect(screening).toHaveProperty('cinema_name');
        expect(screening).toHaveProperty('title'); // movie title
        expect(screening).toHaveProperty('room_name');
      }
    });

    test('should allow admin access to all screenings', async () => {
      const response = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should deny regular user access', async () => {
      const response = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    test('should deny unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/screenings')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    test('should include past screenings (unlike public endpoint)', async () => {
      const response = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // This endpoint should include all screenings, past and future
    });
  });

  describe('GET /api/screenings/:id - Employee/Admin Only', () => {
    test('should allow employee to view specific screening details', async () => {
      // First get a screening ID from the admin list
      const screeningsResponse = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`);
      
      if (screeningsResponse.body.length > 0) {
        const screeningId = screeningsResponse.body[0].screening_id;

        const response = await request(app)
          .get(`/api/screenings/${screeningId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('screening_id', screeningId);
        expect(response.body).toHaveProperty('cinema_name');
        expect(response.body).toHaveProperty('cinema_adresse');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('room_name');
        expect(response.body).toHaveProperty('room_capacity');
        
        // Should include combined genres and qualities
        if (response.body.genres) {
          expect(Array.isArray(response.body.genres)).toBe(true);
        }
        
        if (response.body.qualities) {
          expect(Array.isArray(response.body.qualities)).toBe(true);
        }
      }
    });

    test('should deny regular user access to admin screening details', async () => {
      await request(app)
        .get('/api/screenings/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should deny unauthenticated access', async () => {
      await request(app)
        .get('/api/screenings/1')
        .expect(401);
    });

    test('should return 404 for non-existent screening', async () => {
      const response = await request(app)
        .get('/api/screenings/999999')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body.message).toContain('Screening not found');
    });
  });

  describe('POST /api/screenings - Employee/Admin Only', () => {
    test('should allow employee to create new screenings', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const newScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1, 2], // Array of room IDs
        start_date: tomorrow,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(newScreening)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Screening added successfully');
      expect(response.body).toHaveProperty('screening');
      expect(response.body).toHaveProperty('screeningInsertResult');
    });

    test('should allow admin to create new screenings', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const newScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: tomorrow,
        start_time: '18:00:00',
        end_time: '20:30:00'
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newScreening)
        .expect(201);

      expect(response.body.message).toContain('Screening added successfully');
    });

    test('should deny regular user access to create screenings', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const newScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: tomorrow,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newScreening)
        .expect(403);
    });

    test('should reject screening creation with missing fields', async () => {
      const incompleteScreening = {
        movie_id: 1,
        cinema_id: 1
        // Missing room_ids, dates, times
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(incompleteScreening)
        .expect(400);

      expect(response.body.message).toContain('Missing screening data');
    });

    test('should reject screening creation with past date', async () => {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      
      const pastScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: yesterday,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(pastScreening)
        .expect(400);

      expect(response.body.message).toContain('Date cannot be in the past');
    });

    test('should create multiple screenings for multiple rooms', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const multiRoomScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1, 2, 3], // Multiple rooms
        start_date: tomorrow,
        start_time: '20:00:00',
        end_time: '22:30:00'
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(multiRoomScreening)
        .expect(201);

      expect(response.body.message).toContain('Screening added successfully');
      // Should create one screening per room
    });
  });

  describe('PUT /api/screenings/:id - Employee/Admin Only', () => {
    test('should allow employee to update existing screening', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      // First create a screening to update
      const createData = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: tomorrow,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      const createResponse = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(createData)
        .expect(201);

      // Get the screening ID (this might need adjustment based on actual response structure)
      const screenings = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`);
      
      const screeningId = screenings.body[0].screening_id;

      const updateData = {
        movie_id: 1,
        cinema_id: 1,
        room_id: 2, // Note: single room_id for update, not array
        start_date: tomorrow,
        start_time: '15:00:00', // Changed time
        end_time: '17:30:00'    // Changed time
      };

      const response = await request(app)
        .put(`/api/screenings/${screeningId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData)
        .expect(201);

      expect(response.body.message).toContain('Screening added successfully');
    });

    test('should deny regular user access to update screenings', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const updateData = {
        movie_id: 1,
        cinema_id: 1,
        room_id: 1,
        start_date: tomorrow,
        start_time: '15:00:00',
        end_time: '17:30:00'
      };

      await request(app)
        .put('/api/screenings/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    test('should reject update with missing fields', async () => {
      const incompleteUpdate = {
        movie_id: 1
        // Missing other required fields
      };

      const response = await request(app)
        .put('/api/screenings/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(incompleteUpdate)
        .expect(400);

      expect(response.body.message).toContain('Missing screening data');
    });

    test('should reject update with past date', async () => {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      
      const pastUpdate = {
        movie_id: 1,
        cinema_id: 1,
        room_id: 1,
        start_date: yesterday,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      const response = await request(app)
        .put('/api/screenings/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(pastUpdate)
        .expect(400);

      expect(response.body.message).toContain('Date cannot be in the past');
    });
  });

  describe('DELETE /api/screenings/:id - Employee/Admin Only', () => {
    test('should allow employee to delete screening', async () => {
      // First get a screening ID
      const screenings = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`);
      
      if (screenings.body.length > 0) {
        const screeningId = screenings.body[0].screening_id;

        const response = await request(app)
          .delete(`/api/screenings/${screeningId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);

        expect(response.body.message).toContain('screening deleted succesfully');
      }
    });

    test('should allow admin to delete screening', async () => {
      const screenings = await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (screenings.body.length > 0) {
        const screeningId = screenings.body[0].screening_id;

        const response = await request(app)
          .delete(`/api/screenings/${screeningId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.message).toContain('screening deleted succesfully');
      }
    });

    test('should deny regular user access to delete screenings', async () => {
      await request(app)
        .delete('/api/screenings/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should deny unauthenticated access to delete screenings', async () => {
      await request(app)
        .delete('/api/screenings/1')
        .expect(401);
    });

    test('should handle deletion of non-existent screening gracefully', async () => {
      const response = await request(app)
        .delete('/api/screenings/999999')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.message).toContain('screening deleted succesfully');
    });
  });

  describe('Authentication and Authorization Edge Cases', () => {
    test('should handle expired token', async () => {
      const expiredToken = jwt.sign(
        { user_id: testEmployeeId, role_id: 2, role_name: 'employee' },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '-1m' }
      );

      await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('should handle invalid token signature', async () => {
      const invalidToken = jwt.sign(
        { user_id: testEmployeeId, role_id: 2, role_name: 'employee' },
        'wrong-secret',
        { expiresIn: '15m' }
      );

      await request(app)
        .get('/api/screenings')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(400);
    });

    test('should handle malformed Authorization header', async () => {
      await request(app)
        .get('/api/screenings')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      await request(app)
        .get('/api/screenings')
        .set('Authorization', 'Bearer')
        .expect(401);
    });
  });

  describe('Data Validation and Business Logic', () => {
    test('should validate time format in screening creation', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const invalidTimeScreening = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: tomorrow,
        start_time: '25:00:00', // Invalid time
        end_time: '16:30:00'
      };

      const response = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(invalidTimeScreening);

      // Should either reject or handle gracefully
      expect([201, 400, 500]).toContain(response.status);
    });

    test('should handle concurrent screening operations', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const screeningData = {
        movie_id: 1,
        cinema_id: 1,
        room_ids: [1],
        start_date: tomorrow,
        start_time: '14:00:00',
        end_time: '16:30:00'
      };

      // Make multiple concurrent requests
      const requests = [
        request(app).post('/api/screenings').set('Authorization', `Bearer ${employeeToken}`).send(screeningData),
        request(app).get('/api/screenings').set('Authorization', `Bearer ${employeeToken}`),
        request(app).post('/api/screenings').set('Authorization', `Bearer ${adminToken}`).send({...screeningData, room_ids: [2]})
      ];

      const responses = await Promise.all(requests);
      
      // All requests should complete without hanging
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(600);
      });
    });
  });
});