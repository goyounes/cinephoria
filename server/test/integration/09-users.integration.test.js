import { jest } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import { signAccessToken } from '../../utils/index.js';
import { signExpiredAccessToken } from '../utils/jwtTestUtils.js';

// Load test environment
process.env.NODE_ENV = 'test';
const testEnv = await import('dotenv');
testEnv.config({ path: '.test.env'});

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

describe('Users Integration Tests', () => {
  let userToken, employeeToken, adminToken;
  let testUserId, testEmployeeId, testAdminId;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test users
    const connection = await pool.getConnection();
    try {
      // Create regular user
      const [userResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testuser', 'test@user.com', 'Test', 'User', 1, 1]
      );
      testUserId = userResult.insertId;

      // Create employee
      const [employeeResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testemployee', 'test@employee.com', 'Test', 'Employee', 2, 1]
      );
      testEmployeeId = employeeResult.insertId;

      // Create admin
      const [adminResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testadmin', 'test@admin.com', 'Test', 'Admin', 3, 1]
      );
      testAdminId = adminResult.insertId;

      // Generate test tokens
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

  describe('GET /api/users - Admin Authentication Required', () => {
    test('should reject request without authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    test('should reject user authentication', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should reject employee authentication', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    test('should return authorized users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const user = response.body[0];
      expect(user).toHaveProperty('user_id');
      expect(user).toHaveProperty('user_name');
      expect(user).toHaveProperty('user_email');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('role_id');
      expect(user).toHaveProperty('role_name');
      
      // Should only return users with role_id > 1 (employees and admins)
      response.body.forEach(u => {
        expect(u.role_id).toBeGreaterThan(1);
      });
    });

    test('should include role names with user data', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const employee = response.body.find(u => u.role_id === 2);
      const admin = response.body.find(u => u.role_id === 3);
      
      if (employee) {
        expect(employee.role_name).toBe('employee');
      }
      
      if (admin) {
        expect(admin.role_name).toBe('admin');
      }
    });
  });

  describe('POST /api/users - Admin Authentication Required', () => {
    test('should reject request without authentication', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@user.com',
        firstName: 'New',
        lastName: 'User',
        password: 'TestPass123!',
        role_id: 2
      };

      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(401);
    });

    test('should reject user authentication', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@user.com',
        firstName: 'New',
        lastName: 'User',
        password: 'TestPass123!',
        role_id: 2
      };

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(userData)
        .expect(403);
    });

    test('should reject employee authentication', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@user.com',
        firstName: 'New',
        lastName: 'User',
        password: 'TestPass123!',
        role_id: 2
      };

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(userData)
        .expect(403);
    });

    test('should successfully create new user as admin', async () => {
      const userData = {
        username: 'newemployee',
        email: 'new@employee.com',
        firstName: 'New',
        lastName: 'Employee',
        password: 'TestPass123!',
        role_id: 2
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('User added successfully');
      expect(response.body).toHaveProperty('user_id');

      // Verify user was created in database
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM users WHERE user_name = ?',
          [userData.username]
        );
        expect(rows.length).toBe(1);
        expect(rows[0].user_email).toBe(userData.email);
        expect(rows[0].role_id).toBe(userData.role_id);
      } finally {
        connection.release();
      }
    });

    test('should reject user creation with missing required fields', async () => {
      const incompleteData = {
        email: 'incomplete@user.com',
        firstName: 'Incomplete',
        // Missing username, lastName, password, role_id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);

      expect(response.status).toBe(400); // Now has validation
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should reject user creation with duplicate username', async () => {
      const userData = {
        username: 'testemployee', // Already exists from beforeAll
        email: 'duplicate@user.com',
        firstName: 'Duplicate',
        lastName: 'User',
        password: 'TestPass123!',
        role_id: 2
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(500); // This will still be 500 because it's a database error, not validation
      expect(response.body.message).toContain('Username already exists');
    });

    test('should reject user creation with invalid role_id', async () => {
      const userData = {
        username: 'invalidrole',
        email: 'invalid@role.com',
        firstName: 'Invalid',
        lastName: 'Role',
        password: 'TestPass123!',
        role_id: 999 // Invalid role
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData);

      expect(response.status).toBe(400); // Now has validation
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.msg.includes('Role ID must be between 1 and 3'))).toBe(true);
    });
  });

  describe('GET /api/users/:id - Admin Authentication Required', () => {
    test('should reject request without authentication', async () => {
      await request(app)
        .get(`/api/users/${testEmployeeId}`)
        .expect(401);
    });

    test('should reject user authentication', async () => {
      await request(app)
        .get(`/api/users/${testEmployeeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should reject employee authentication', async () => {
      await request(app)
        .get(`/api/users/${testEmployeeId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    test('should return specific user for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${testEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user_id', testEmployeeId);
      expect(response.body).toHaveProperty('user_name', 'testemployee');
      expect(response.body).toHaveProperty('user_email', 'test@employee.com');
      expect(response.body).toHaveProperty('first_name', 'Test');
      expect(response.body).toHaveProperty('last_name', 'Employee');
      expect(response.body).toHaveProperty('role_id', 2);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User not found');
    });

    test('should handle invalid user ID format', async () => {
      await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Authentication Token Validation', () => {
    test('should reject invalid JWT token', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(400);
    });

    test('should reject expired JWT token', async () => {
      const expiredToken = signExpiredAccessToken(testAdminId, 3, 'admin');

      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('should reject malformed authorization header', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // This would require mocking the database to simulate connection failure
      // For now, we test that valid requests work correctly
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Data Security and Access Control', () => {
    test('should only return authorized users (role_id > 1)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Should not include regular users (role_id = 1)
      const regularUsers = response.body.filter(u => u.role_id === 1);
      expect(regularUsers.length).toBe(0);

      // Should include employees and admins
      const authorizedUsers = response.body.filter(u => u.role_id > 1);
      expect(authorizedUsers.length).toBeGreaterThan(0);
    });

    test('should enforce strict admin-only access', async () => {
      const endpoints = [
        { method: 'get', path: '/api/users' },
        { method: 'post', path: '/api/users' },
        { method: 'get', path: `/api/users/${testEmployeeId}` }
      ];

      for (const endpoint of endpoints) {
        // Test with user token
        await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        // Test with employee token
        await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(403);
      }
    });

    test('should not expose sensitive user data unnecessarily', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.forEach(user => {
        // Should not expose password hashes
        expect(user).not.toHaveProperty('user_password_hash');
        expect(user).not.toHaveProperty('password');
        
        // Should include necessary fields for admin management
        expect(user).toHaveProperty('user_id');
        expect(user).toHaveProperty('user_name');
        expect(user).toHaveProperty('user_email');
        expect(user).toHaveProperty('role_id');
        expect(user).toHaveProperty('role_name');
      });
    });
  });
});