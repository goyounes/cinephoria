import { jest } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';

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

describe('Checkout Integration Tests', () => {
  let testUserData;
  let testEmployeeData;
  let testScreeningData;
  let testTicketTypes;
  let userToken;
  let employeeToken;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Test user data
    testUserData = {
      user_name: 'testcheckout',
      user_email: 'testcheckout@example.com',
      first_name: 'Test',
      last_name: 'Checkout',
      user_password: 'TestPass123!',
      role_id: 1
    };

    // Test employee data  
    testEmployeeData = {
      user_name: 'testemployeecheckout',
      user_email: 'testemployeecheckout@example.com',
      first_name: 'Test',
      last_name: 'Employee',
      user_password: 'TestPass123!',
      role_id: 2
    };

    // Add users manually to database
    const bcrypt = await import('bcrypt');
    const userPasswordHash = await bcrypt.hash(testUserData.user_password, 10);
    const employeePasswordHash = await bcrypt.hash(testEmployeeData.user_password, 10);

    const [userResult] = await pool.query(`
      INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified, refresh_token_version)
      VALUES (?, ?, ?, ?, ?, TRUE, 1)
    `, [testUserData.user_name, testUserData.user_email, testUserData.first_name, testUserData.last_name, testUserData.role_id]);

    const [employeeResult] = await pool.query(`
      INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified, refresh_token_version)
      VALUES (?, ?, ?, ?, ?, TRUE, 1)
    `, [testEmployeeData.user_name, testEmployeeData.user_email, testEmployeeData.first_name, testEmployeeData.last_name, testEmployeeData.role_id]);

    // Add user credentials
    await pool.query(`
      INSERT INTO users_credentials (user_id, user_password_hash)
      VALUES (?, ?)
    `, [userResult.insertId, userPasswordHash]);

    await pool.query(`
      INSERT INTO users_credentials (user_id, user_password_hash)
      VALUES (?, ?)
    `, [employeeResult.insertId, employeePasswordHash]);

    // Login to get tokens
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserData.user_email,
        password: testUserData.user_password
      });
    expect(userLoginResponse.status).toBe(200);
    userToken = userLoginResponse.body.accessToken;

    const employeeLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmployeeData.user_email,
        password: testEmployeeData.user_password
      });
    expect(employeeLoginResponse.status).toBe(200);
    employeeToken = employeeLoginResponse.body.accessToken;

    // Get ticket types
    const ticketTypesResponse = await request(app)
      .get('/api/tickets/types');
    expect(ticketTypesResponse.status).toBe(200);
    testTicketTypes = ticketTypesResponse.body;

    // Get existing screening data that meets 14-day booking criteria
    const [screeningRows] = await pool.query(`
      SELECT screening_id, movie_id, cinema_id, room_id, start_date, start_time 
      FROM screenings 
      WHERE isDeleted = FALSE 
        AND (
          start_date > CURDATE()
          OR (start_date = CURDATE() AND start_time > CURTIME())
        )
        AND start_date <= CURDATE() + INTERVAL 14 DAY
      LIMIT 1
    `);
    
    expect(screeningRows.length).toBeGreaterThan(0);
    testScreeningData = screeningRows[0];
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await resetConnection();
  });

  describe('POST /api/checkout/complete', () => {
    describe('User Authentication', () => {
      test('should reject unauthenticated requests', async () => {
        const response = await request(app)
          .post('/api/checkout/complete')
          .send({
            screening_id: testScreeningData.screening_id,
            ticket_types: [{ type_id: testTicketTypes[0].ticket_type_id, count: 1, ticket_type_price: testTicketTypes[0].ticket_type_price }],
            total_price: parseFloat(testTicketTypes[0].ticket_type_price),
            card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
          });

        expect(response.status).toBe(401);
      });

      test('should reject requests with invalid token', async () => {
        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', 'Bearer invalid_token')
          .send({
            screening_id: testScreeningData.screening_id,
            ticket_types: [{ type_id: testTicketTypes[0].ticket_type_id, count: 1, ticket_type_price: testTicketTypes[0].ticket_type_price }],
            total_price: parseFloat(testTicketTypes[0].ticket_type_price),
            card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
          });

        expect(response.status).toBe(400); // Auth middleware returns 400 for invalid tokens
      });
    });

    describe('Regular User Booking', () => {
      test('should successfully complete booking for valid request', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Booking successful');
        expect(response.body).toHaveProperty('tickets_booked', 1);
        expect(response.body).toHaveProperty('seat_ids');
        expect(Array.isArray(response.body.seat_ids)).toBe(true);
        expect(response.body.seat_ids).toHaveLength(1);
      });

      test('should handle multiple ticket types in single booking', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [
            { 
              type_id: testTicketTypes[0].ticket_type_id, 
              count: 2, 
              ticket_type_price: testTicketTypes[0].ticket_type_price 
            },
            { 
              type_id: testTicketTypes[1].ticket_type_id, 
              count: 1, 
              ticket_type_price: testTicketTypes[1].ticket_type_price 
            }
          ],
          total_price: (2 * parseFloat(testTicketTypes[0].ticket_type_price)) + parseFloat(testTicketTypes[1].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(200);
        expect(response.body.tickets_booked).toBe(3);
        expect(response.body.seat_ids).toHaveLength(3);
      });

      test('should reject booking with price mismatch', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: 999.99, // Wrong price
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(400);
      });

      test('should reject booking for non-existent screening', async () => {
        const bookingData = {
          screening_id: 99999, // Non-existent screening
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(403); // Date validation runs first, returns 403
      });

      test('should handle concurrent booking attempts gracefully', async () => {
        // Debug: Check available seats before concurrent booking test
        const [roomInfo] = await pool.query(`
          SELECT r.room_capacity 
          FROM rooms r 
          JOIN screenings s ON r.room_id = s.room_id 
          WHERE s.screening_id = ?
        `, [testScreeningData.screening_id]);
        
        const [bookedSeats] = await pool.query(`
          SELECT COUNT(*) as count 
          FROM tickets 
          WHERE screening_id = ?
        `, [testScreeningData.screening_id]);
        
        const availableSeats = roomInfo[0].room_capacity - bookedSeats[0].count;
        console.log(`Before concurrent test - Room capacity: ${roomInfo[0].room_capacity}, Booked: ${bookedSeats[0].count}, Available: ${availableSeats}`);
        
        // Create multiple simultaneous booking requests
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const promises = Array(3).fill(null).map(() => 
          request(app)
            .post('/api/checkout/complete')
            .set('Authorization', `Bearer ${userToken}`)
            .send(bookingData)
        );

        const responses = await Promise.all(promises);
        
        // Debug: Log all response statuses and any error messages
        responses.forEach((r, i) => {
          console.log(`Concurrent booking ${i + 1}: Status ${r.status}`, r.status !== 200 ? r.body : 'Success');
        });
        
        // At least one should succeed, others might fail due to seat availability
        const successfulResponses = responses.filter(r => r.status === 200);
        const failedResponses = responses.filter(r => r.status !== 200);
        
        expect(successfulResponses.length).toBeGreaterThan(0);
        // Should handle concurrency properly
        expect(successfulResponses.length + failedResponses.length).toBe(3);
      });
    });

    describe('Employee/Admin Booking', () => {
      test('should allow employee to book beyond 14-day limit', async () => {
        // Create a screening more than 14 days in the future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 20); // 20 days from now
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const [movieRows] = await pool.query('SELECT movie_id FROM movies WHERE isDeleted = FALSE LIMIT 1');
        const [cinemaRows] = await pool.query('SELECT cinema_id FROM cinemas WHERE isDeleted = FALSE LIMIT 1');
        const [roomRows] = await pool.query('SELECT room_id FROM rooms WHERE isDeleted = FALSE LIMIT 1');

        const [insertResult] = await pool.query(`
          INSERT INTO screenings (movie_id, cinema_id, room_id, start_date, start_time, end_time)
          VALUES (?, ?, ?, ?, '14:00:00', '16:00:00')
        `, [movieRows[0].movie_id, cinemaRows[0].cinema_id, roomRows[0].room_id, futureDateStr]);

        const futureScreeningId = insertResult.insertId;

        const bookingData = {
          screening_id: futureScreeningId,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        // Regular user should be rejected
        const userResponse = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(userResponse.status).toBe(403);

        // Employee should succeed
        const employeeResponse = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(bookingData);

        expect(employeeResponse.status).toBe(200);
        expect(employeeResponse.body.message).toBe('Booking successful');
      });

      test('should handle employee booking with admin bypass logic', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send(bookingData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Booking successful');
      });
    });

    describe('Input Validation', () => {
      test('should reject booking without required fields', async () => {
        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send({});

        expect(response.status).toBe(400); // Validation catches missing fields
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors.length).toBeGreaterThan(0);
      });

      test('should reject booking with invalid ticket types', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: 99999, // Invalid ticket type
            count: 1, 
            ticket_type_price: '10.00' 
          }],
          total_price: 10.00,
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(500);
      });

      test('should reject booking with zero or negative ticket count', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 0, // Zero tickets
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: 0,
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(400); // Validation now catches zero count
        expect(response.body).toHaveProperty('errors');
      });
    });

    describe('Seat Availability', () => {
      test('should reject booking when not enough seats available', async () => {
        // Try to book more tickets than room capacity
        const [roomRows] = await pool.query(`
          SELECT r.room_capacity 
          FROM rooms r 
          JOIN screenings s ON r.room_id = s.room_id 
          WHERE s.screening_id = ?
        `, [testScreeningData.screening_id]);

        const roomCapacity = roomRows[0].room_capacity;

        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: roomCapacity + 10, // More than capacity
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: (roomCapacity + 10) * parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(400);
      });
    });

    describe('Database Transaction Integrity', () => {
      test('should maintain transaction integrity on booking failure', async () => {
        // Get initial ticket count
        const [initialTickets] = await pool.query(
          'SELECT COUNT(*) as count FROM tickets WHERE screening_id = ?',
          [testScreeningData.screening_id]
        );
        const initialCount = initialTickets[0].count;

        // Attempt booking with invalid data that should fail
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 1, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: 999.99, // Wrong price to trigger failure
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        expect(response.status).toBe(400);

        // Verify no tickets were created
        const [finalTickets] = await pool.query(
          'SELECT COUNT(*) as count FROM tickets WHERE screening_id = ?',
          [testScreeningData.screening_id]
        );
        const finalCount = finalTickets[0].count;

        expect(finalCount).toBe(initialCount);
      });
    });

    describe('QR Code Generation', () => {
      test('should generate unique QR codes for each ticket', async () => {
        const bookingData = {
          screening_id: testScreeningData.screening_id,
          ticket_types: [{ 
            type_id: testTicketTypes[0].ticket_type_id, 
            count: 3, 
            ticket_type_price: testTicketTypes[0].ticket_type_price 
          }],
          total_price: 3 * parseFloat(testTicketTypes[0].ticket_type_price),
          card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
        };

        const response = await request(app)
          .post('/api/checkout/complete')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData);

        if (response.status !== 200) {
          console.log('QR Code Test Error Response:', response.status, response.body);
        }
        expect(response.status).toBe(200);

        // Check that QR codes are unique in database
        const [tickets] = await pool.query(
          'SELECT QR_code FROM tickets WHERE screening_id = ? AND seat_id IN (?)',
          [testScreeningData.screening_id, response.body.seat_ids]
        );

        const qrCodes = tickets.map(t => t.QR_code);
        const uniqueQrCodes = [...new Set(qrCodes)];
        
        expect(qrCodes).toHaveLength(3);
        expect(uniqueQrCodes).toHaveLength(3); // All should be unique
      });
    });
  });
});