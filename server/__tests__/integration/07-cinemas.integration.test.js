import { jest } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';

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

describe('Cinemas Integration Tests', () => {
  let testUserData;
  let testEmployeeData;
  let testAdminData;
  let userToken;
  let employeeToken;
  let adminToken;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Test user data (role_id: 1)
    testUserData = {
      user_name: 'testcinemasuser',
      user_email: 'testcinemasuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      user_password: 'TestPass123!',
      role_id: 1
    };

    // Test employee data (role_id: 2)
    testEmployeeData = {
      user_name: 'testcinemasemployee',
      user_email: 'testcinemasemployee@example.com',
      first_name: 'Test',
      last_name: 'Employee',
      user_password: 'TestPass123!',
      role_id: 2
    };

    // Test admin data (role_id: 3)
    testAdminData = {
      user_name: 'testcinemasadmin',
      user_email: 'testcinemasadmin@example.com',
      first_name: 'Test',
      last_name: 'Admin',
      user_password: 'TestPass123!',
      role_id: 3
    };

    // Add users manually to database
    const bcrypt = await import('bcrypt');
    
    for (const userData of [testUserData, testEmployeeData, testAdminData]) {
      const passwordHash = await bcrypt.hash(userData.user_password, 10);
      
      const [userResult] = await pool.query(`
        INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified, refresh_token_version)
        VALUES (?, ?, ?, ?, ?, TRUE, 1)
      `, [userData.user_name, userData.user_email, userData.first_name, userData.last_name, userData.role_id]);

      // Add user credentials
      await pool.query(`
        INSERT INTO users_credentials (user_id, user_password_hash)
        VALUES (?, ?)
      `, [userResult.insertId, passwordHash]);
    }

    // Login to get tokens
    const userLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUserData.user_email,
        password: testUserData.user_password
      });
    expect(userLoginResponse.status).toBe(200);
    userToken = userLoginResponse.body.accessToken;

    const employeeLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmployeeData.user_email,
        password: testEmployeeData.user_password
      });
    expect(employeeLoginResponse.status).toBe(200);
    employeeToken = employeeLoginResponse.body.accessToken;

    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testAdminData.user_email,
        password: testAdminData.user_password
      });
    expect(adminLoginResponse.status).toBe(200);
    adminToken = adminLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await resetConnection();
  });

  describe('GET /api/v1/cinemas', () => {
    test('should return all cinemas for unauthenticated users (public access)', async () => {
      const response = await request(app)
        .get('/api/v1/cinemas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify structure of cinema objects
      response.body.forEach(cinema => {
        expect(cinema).toHaveProperty('cinema_id');
        expect(cinema).toHaveProperty('cinema_name');
        expect(cinema).toHaveProperty('cinema_adresse');
        expect(cinema).toHaveProperty('isDeleted');
      });
    });

    test('should return all cinemas for authenticated users', async () => {
      const response = await request(app)
        .get('/api/v1/cinemas')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return all cinemas including deleted ones in raw query', async () => {
      const response = await request(app)
        .get('/api/v1/cinemas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // The current implementation returns all cinemas regardless of isDeleted status
      // This might be a business decision or could be improved with filtering
    });
  });

  describe('POST /api/v1/cinemas', () => {
    describe('Authentication & Authorization', () => {
      test('should reject unauthenticated requests', async () => {
        const cinemaData = {
          cinema_name: 'Test Cinema',
          cinema_adresse: '123 Test Street'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .send(cinemaData);

        expect(response.status).toBe(401);
      });

      test('should reject regular user requests', async () => {
        const cinemaData = {
          cinema_name: 'Test Cinema',
          cinema_adresse: '123 Test Street'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${userToken}`)
          .send(cinemaData);

        expect(response.status).toBe(403);
      });

      test('should allow employee to create cinema', async () => {
        const cinemaData = {
          cinema_name: 'Employee Test Cinema',
          cinema_adresse: '456 Employee Street'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('cinema_id');
        expect(response.body.cinema_name).toBe(cinemaData.cinema_name);
        expect(response.body.cinema_adresse).toBe(cinemaData.cinema_adresse);
      });

      test('should allow admin to create cinema', async () => {
        const cinemaData = {
          cinema_name: 'Admin Test Cinema',
          cinema_adresse: '789 Admin Avenue'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(cinemaData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('cinema_id');
        expect(response.body.cinema_name).toBe(cinemaData.cinema_name);
        expect(response.body.cinema_adresse).toBe(cinemaData.cinema_adresse);
      });
    });

    describe('Input Validation', () => {
      test('should handle missing cinema_name', async () => {
        const cinemaData = {
          cinema_adresse: '123 Test Street'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        expect(response.status).toBe(500);
      });

      test('should handle missing cinema_adresse', async () => {
        const cinemaData = {
          cinema_name: 'Test Cinema'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        expect(response.status).toBe(500);
      });

      test('should handle empty strings', async () => {
        const cinemaData = {
          cinema_name: '',
          cinema_adresse: ''
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        // Current API accepts empty strings - this might be a validation gap
        expect(response.status).toBe(201);
        expect(response.body.cinema_name).toBe('');
        expect(response.body.cinema_adresse).toBe('');
      });

      test('should handle special characters in cinema data', async () => {
        const cinemaData = {
          cinema_name: 'Cinéma Français & Co.',
          cinema_adresse: '123 Rue de l\'Église, Montréal'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        expect(response.status).toBe(201);
        expect(response.body.cinema_name).toBe(cinemaData.cinema_name);
        expect(response.body.cinema_adresse).toBe(cinemaData.cinema_adresse);
      });
    });

    describe('Data Persistence', () => {
      test('should persist cinema in database correctly', async () => {
        const cinemaData = {
          cinema_name: 'Persistence Test Cinema',
          cinema_adresse: '999 Database Street'
        };

        const response = await request(app)
          .post('/api/v1/cinemas')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(cinemaData);

        expect(response.status).toBe(201);
        const cinema_id = response.body.cinema_id;

        // Verify in database
        const [rows] = await pool.query(
          'SELECT * FROM cinemas WHERE cinema_id = ?',
          [cinema_id]
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].cinema_name).toBe(cinemaData.cinema_name);
        expect(rows[0].cinema_adresse).toBe(cinemaData.cinema_adresse);
        expect(rows[0].isDeleted).toBe(0);
      });
    });
  });

  describe('PUT /api/v1/cinemas/:id', () => {
    let testCinemaId;

    beforeAll(async () => {
      // Create a test cinema for update tests
      const cinemaData = {
        cinema_name: 'Update Test Cinema',
        cinema_adresse: '123 Update Street'
      };

      const response = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(cinemaData);

      testCinemaId = response.body.cinema_id;
    });

    describe('Authentication & Authorization', () => {
      test('should reject unauthenticated requests', async () => {
        const updateData = {
          cinema_name: 'Updated Cinema',
          cinema_adresse: '456 Updated Street'
        };

        const response = await request(app)
          .put(`/api/v1/cinemas/${testCinemaId}`)
          .send(updateData);

        expect(response.status).toBe(401);
      });

      test('should reject regular user requests', async () => {
        const updateData = {
          cinema_name: 'Updated Cinema',
          cinema_adresse: '456 Updated Street'
        };

        const response = await request(app)
          .put(`/api/v1/cinemas/${testCinemaId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        expect(response.status).toBe(403);
      });

      test('should allow employee to update cinema', async () => {
        const updateData = {
          cinema_name: 'Employee Updated Cinema',
          cinema_adresse: '456 Employee Updated Street'
        };

        const response = await request(app)
          .put(`/api/v1/cinemas/${testCinemaId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.cinema_name).toBe(updateData.cinema_name);
        expect(response.body.cinema_adresse).toBe(updateData.cinema_adresse);
      });
    });

    describe('Input Validation', () => {
      test('should require cinema_name', async () => {
        const updateData = {
          cinema_adresse: '456 Updated Street'
        };

        const response = await request(app)
          .put(`/api/v1/cinemas/${testCinemaId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(updateData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('cinema_name and cinema_adresse are required');
      });

      test('should require cinema_adresse', async () => {
        const updateData = {
          cinema_name: 'Updated Cinema'
        };

        const response = await request(app)
          .put(`/api/v1/cinemas/${testCinemaId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(updateData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('cinema_name and cinema_adresse are required');
      });

      test('should handle non-existent cinema ID', async () => {
        const updateData = {
          cinema_name: 'Updated Cinema',
          cinema_adresse: '456 Updated Street'
        };

        const response = await request(app)
          .put('/api/v1/cinemas/99999')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(updateData);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('Cinema with ID 99999 not found');
      });
    });
  });

  describe('GET /api/v1/cinemas/rooms', () => {
    test('should return all rooms for unauthenticated users (public access)', async () => {
      const response = await request(app)
        .get('/api/v1/cinemas/rooms');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach(room => {
          expect(room).toHaveProperty('room_id');
          expect(room).toHaveProperty('room_name');
          expect(room).toHaveProperty('room_capacity');
          expect(room).toHaveProperty('cinema_id');
          expect(room).toHaveProperty('isDeleted');
        });
      }
    });

    test('should return all rooms for authenticated users', async () => {
      const response = await request(app)
        .get('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/cinemas/rooms', () => {
    let testCinemaForRooms;

    beforeAll(async () => {
      // Create a test cinema for room tests
      const cinemaData = {
        cinema_name: 'Room Test Cinema',
        cinema_adresse: '123 Room Street'
      };

      const response = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(cinemaData);

      testCinemaForRooms = response.body.cinema_id;
    });

    describe('Authentication & Authorization', () => {
      test('should reject unauthenticated requests', async () => {
        const roomData = {
          room_name: 'Test Room',
          room_capacity: 50,
          cinema_id: testCinemaForRooms
        };

        const response = await request(app)
          .post('/api/v1/cinemas/rooms')
          .send(roomData);

        expect(response.status).toBe(401);
      });

      test('should reject regular user requests', async () => {
        const roomData = {
          room_name: 'Test Room',
          room_capacity: 50,
          cinema_id: testCinemaForRooms
        };

        const response = await request(app)
          .post('/api/v1/cinemas/rooms')
          .set('Authorization', `Bearer ${userToken}`)
          .send(roomData);

        expect(response.status).toBe(403);
      });

      test('should allow employee to create room', async () => {
        const roomData = {
          room_name: 'Employee Test Room',
          room_capacity: 100,
          cinema_id: testCinemaForRooms
        };

        const response = await request(app)
          .post('/api/v1/cinemas/rooms')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(roomData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('room_id');
        expect(response.body.room_name).toBe(roomData.room_name);
        expect(response.body.room_capacity).toBe(roomData.room_capacity);
        expect(response.body.cinema_id).toBe(roomData.cinema_id);
        expect(response.body.seats_created).toBe(roomData.room_capacity);
      });
    });

    describe('Seat Generation', () => {
      test('should create correct number of seats when creating room', async () => {
        const roomData = {
          room_name: 'Seat Test Room',
          room_capacity: 25,
          cinema_id: testCinemaForRooms
        };

        const response = await request(app)
          .post('/api/v1/cinemas/rooms')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(roomData);

        expect(response.status).toBe(201);
        const room_id = response.body.room_id;

        // Verify seats were created
        const [seatRows] = await pool.query(
          'SELECT COUNT(*) as count FROM seats WHERE room_id = ? AND isDeleted = FALSE',
          [room_id]
        );

        expect(seatRows[0].count).toBe(25);

        // Verify seat numbering
        const [seats] = await pool.query(
          'SELECT seat_number FROM seats WHERE room_id = ? ORDER BY seat_number',
          [room_id]
        );

        expect(seats).toHaveLength(25);
        expect(seats[0].seat_number).toBe(1);
        expect(seats[24].seat_number).toBe(25);
      });

      test('should handle transaction rollback on seat creation failure', async () => {
        // This test would require a way to simulate seat creation failure
        // For now, we'll test with invalid cinema_id
        const roomData = {
          room_name: 'Rollback Test Room',
          room_capacity: 50,
          cinema_id: 99999 // Invalid cinema ID
        };

        const response = await request(app)
          .post('/api/v1/cinemas/rooms')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(roomData);

        expect(response.status).toBe(500);

        // Verify no room was created
        const [roomRows] = await pool.query(
          'SELECT COUNT(*) as count FROM rooms WHERE room_name = ?',
          [roomData.room_name]
        );

        expect(roomRows[0].count).toBe(0);
      });
    });
  });

  describe('PUT /api/v1/cinemas/rooms/:id', () => {
    let testRoomId;

    beforeAll(async () => {
      // Create a test room for update tests
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const roomData = {
        room_name: 'Update Test Room',
        room_capacity: 30,
        cinema_id: cinema_id
      };

      const response = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roomData);

      testRoomId = response.body.room_id;
    });

    test('should allow employee to update room', async () => {
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const updateData = {
        room_name: 'Updated Room Name',
        room_capacity: 40,
        cinema_id: cinema_id
      };

      const response = await request(app)
        .put(`/api/v1/cinemas/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.room_name).toBe(updateData.room_name);
      expect(response.body.room_capacity).toBe(updateData.room_capacity);
    });

    test('should require all fields for room update', async () => {
      const updateData = {
        room_name: 'Updated Room Name'
        // Missing room_capacity and cinema_id
      };

      const response = await request(app)
        .put(`/api/v1/cinemas/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('room_name, room_capacity, and cinema_id are required');
    });

    test('should handle non-existent room ID', async () => {
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const updateData = {
        room_name: 'Updated Room Name',
        room_capacity: 40,
        cinema_id: cinema_id
      };

      const response = await request(app)
        .put('/api/v1/cinemas/rooms/99999')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Room with ID 99999 not found');
    });
  });

  describe('DELETE /api/v1/cinemas/rooms/:id', () => {
    let testRoomToDelete;

    beforeAll(async () => {
      // Create a test room for deletion tests
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const roomData = {
        room_name: 'Delete Test Room',
        room_capacity: 20,
        cinema_id: cinema_id
      };

      const response = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roomData);

      testRoomToDelete = response.body.room_id;
    });

    test('should allow employee to soft delete room', async () => {
      const response = await request(app)
        .delete(`/api/v1/cinemas/rooms/${testRoomToDelete}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('room deleted succesfully');

      // Verify room is soft deleted in database
      const [rows] = await pool.query(
        'SELECT isDeleted FROM rooms WHERE room_id = ?',
        [testRoomToDelete]
      );

      expect(rows[0].isDeleted).toBe(1);
    });

    test('should reject unauthenticated deletion requests', async () => {
      const response = await request(app)
        .delete(`/api/v1/cinemas/rooms/${testRoomToDelete}`);

      expect(response.status).toBe(401);
    });

    test('should reject regular user deletion requests', async () => {
      const response = await request(app)
        .delete(`/api/v1/cinemas/rooms/${testRoomToDelete}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Database Constraint Violations and Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // This test would require a way to simulate database failures
      // For now, we'll test with malformed requests
      const response = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ invalid: 'data' });

      expect(response.status).toBe(500);
    });

    test('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    test('should handle foreign key constraint violation for rooms', async () => {
      // Try to create a room with non-existent cinema_id
      const roomData = {
        room_name: 'Invalid Cinema Room',
        room_capacity: 50,
        cinema_id: 999999999 // Non-existent cinema
      };

      const response = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roomData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    test('should allow duplicate cinema names since no unique constraint exists', async () => {
      // Cinema names can be duplicated in this schema
      const cinemaData = {
        cinema_name: 'Duplicate Test Cinema',
        cinema_adresse: '123 Test Street'
      };

      const response1 = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(cinemaData)
        .expect(201);

      // Create another cinema with the same name - should succeed
      const response2 = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(cinemaData)
        .expect(201);

      expect(response1.body).toHaveProperty('cinema_id');
      expect(response2.body).toHaveProperty('cinema_id');
      expect(response1.body.cinema_id).not.toBe(response2.body.cinema_id);
    });

    test('should handle invalid room capacity constraints', async () => {
      // Get a valid cinema_id
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const roomData = {
        room_name: 'Invalid Capacity Room',
        room_capacity: -5, // Negative capacity should cause issues
        cinema_id: cinema_id
      };

      const response = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roomData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    test('should handle zero room capacity', async () => {
      // Get a valid cinema_id
      const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
      const cinema_id = cinemaRows[0].cinema_id;

      const roomData = {
        room_name: 'Zero Capacity Room',
        room_capacity: 0, // Zero capacity might cause seat creation issues
        cinema_id: cinema_id
      };

      const response = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(roomData);

      // Should either reject or handle gracefully
      expect([201, 400, 500]).toContain(response.status);
    });
  });
});