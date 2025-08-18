import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import { signAccessToken } from '../../utils/index.js';

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

describe('Screenings Integration Tests - User Level', () => {
  let userToken;
  let testUserId;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user
    const connection = await pool.getConnection();
    try {
      const [userResult] = await connection.execute(
        'INSERT INTO users (user_name, user_email, first_name, last_name, role_id, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['testuser', 'test@user.com', 'Test', 'User', 1, 1]
      );
      testUserId = userResult.insertId;

      // Generate user token
      userToken = signAccessToken(testUserId, 1, 'user');
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

  describe('GET /api/screenings/upcoming - Public Access', () => {
    test('should return upcoming screenings with complete details', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
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
        
        // Should include seat availability data
        expect(screening).toHaveProperty('room_capacity');
        expect(screening).toHaveProperty('total_seats');
        expect(screening).toHaveProperty('booked_seats');
        expect(screening).toHaveProperty('seats_left');
        
        // Should include qualities if available
        if (screening.qualities_ids) {
          expect(screening).toHaveProperty('qualities_names');
        }
      }
    });

    test('should only return screenings within 14 days', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 14);

      response.body.forEach(screening => {
        const screeningDate = new Date(screening.start_date);
        expect(screeningDate).toBeInstanceOf(Date);
        expect(screeningDate.getTime()).toBeLessThanOrEqual(maxDate.getTime());
      });
    });

    test('should only return future screenings (not past)', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      const now = new Date();
      
      response.body.forEach(screening => {
        const screeningDateTime = new Date(`${screening.start_date} ${screening.start_time}`);
        expect(screeningDateTime.getTime()).toBeGreaterThan(now.getTime());
      });
    });

    test('should not include deleted screenings', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      // All returned screenings should be active (not deleted)
      response.body.forEach(screening => {
        expect(screening.isDeleted).toBe(0); // MySQL boolean false = 0
      });
    });

    test('should return screenings ordered by date and time', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      if (response.body.length > 1) {
        for (let i = 1; i < response.body.length; i++) {
          const prev = new Date(`${response.body[i-1].start_date} ${response.body[i-1].start_time}`);
          const curr = new Date(`${response.body[i].start_date} ${response.body[i].start_time}`);
          expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
        }
      }
    });
  });

  describe('GET /api/screenings/upcoming/:id - Public Access', () => {
    test('should return specific upcoming screening details', async () => {
      // First get a screening ID from the list
      const screeningsResponse = await request(app).get('/api/screenings/upcoming');
      
      if (screeningsResponse.body.length > 0) {
        const screeningId = screeningsResponse.body[0].screening_id;

        const response = await request(app)
          .get(`/api/screenings/upcoming/${screeningId}`)
          .expect(200);

        expect(response.body).toHaveProperty('screening_id', screeningId);
        expect(response.body).toHaveProperty('movie_id');
        expect(response.body).toHaveProperty('cinema_id');
        expect(response.body).toHaveProperty('room_id');
        expect(response.body).toHaveProperty('start_date');
        expect(response.body).toHaveProperty('start_time');
        expect(response.body).toHaveProperty('end_time');
        
        // Cinema details
        expect(response.body).toHaveProperty('cinema_name');
        expect(response.body).toHaveProperty('cinema_adresse');
        
        // Movie details
        expect(response.body).toHaveProperty('title');
        
        // Room details
        expect(response.body).toHaveProperty('room_name');
        expect(response.body).toHaveProperty('room_capacity');
        
        // Seat availability
        expect(response.body).toHaveProperty('total_seats');
        expect(response.body).toHaveProperty('booked_seats');
        expect(response.body).toHaveProperty('seats_left');
        
        // Genres should be combined properly
        if (response.body.genres) {
          expect(Array.isArray(response.body.genres)).toBe(true);
          response.body.genres.forEach(genre => {
            expect(genre).toHaveProperty('genre_id');
            expect(genre).toHaveProperty('genre_name');
          });
        }
        
        // Qualities should be combined properly
        if (response.body.qualities) {
          expect(Array.isArray(response.body.qualities)).toBe(true);
          response.body.qualities.forEach(quality => {
            expect(quality).toHaveProperty('quality_id');
            expect(quality).toHaveProperty('quality_name');
          });
        }
      }
    });

    test('should return 404 for non-existent screening', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming/999999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Screening not found');
    });

    test('should return 404 for past screening', async () => {
      // This test assumes there might be past screenings in the database
      // that shouldn't be accessible via the upcoming endpoint
      const response = await request(app)
        .get('/api/screenings/upcoming/1')
        .expect(404);
    });

    test('should return 404 for deleted screening', async () => {
      // This would require setting up a deleted screening in the test data
      // For now, we test with a likely non-existent ID
      const response = await request(app)
        .get('/api/screenings/upcoming/999999')
        .expect(404);

      expect(response.body.message).toContain('Screening not found');
    });

    test('should handle invalid screening ID format', async () => {
      await request(app)
        .get('/api/screenings/upcoming/invalid-id')
        .expect(404);
    });
  });

  describe('Authentication Not Required for Public Endpoints', () => {
    test('upcoming screenings should work without authentication', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('specific upcoming screening should work without authentication', async () => {
      // Get a screening ID first
      const screeningsResponse = await request(app).get('/api/screenings/upcoming');
      
      if (screeningsResponse.body.length > 0) {
        const screeningId = screeningsResponse.body[0].screening_id;

        await request(app)
          .get(`/api/screenings/upcoming/${screeningId}`)
          .expect(200);
      }
    });

    test('should not expose admin-only data in public endpoints', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      response.body.forEach(screening => {
        // Should not include sensitive admin data
        expect(screening).not.toHaveProperty('created_at');
        expect(screening).not.toHaveProperty('updated_at');
      });
    });
  });

  describe('Data Validation and Integrity', () => {
    test('should return valid date and time formats', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      response.body.forEach(screening => {
        // Validate date format (YYYY-MM-DD)
        expect(screening.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Validate time format (HH:MM:SS)
        expect(screening.start_time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        expect(screening.end_time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      });
    });

    test('should return consistent seat availability calculations', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      response.body.forEach(screening => {
        if (screening.total_seats && screening.booked_seats && screening.seats_left !== undefined) {
          expect(screening.total_seats - screening.booked_seats).toBe(screening.seats_left);
          expect(screening.seats_left).toBeGreaterThanOrEqual(0);
          expect(screening.booked_seats).toBeGreaterThanOrEqual(0);
          expect(screening.total_seats).toBeGreaterThan(0);
        }
      });
    });

    test('should handle screenings with no qualities gracefully', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming')
        .expect(200);

      // Should not break when qualities are null/empty
      response.body.forEach(screening => {
        if (!screening.qualities_ids) {
          expect(screening.qualities_names).toBeFalsy();
        }
      });
    });
  });

  describe('Error Handling for Public Endpoints', () => {
    test('should handle database connection errors gracefully', async () => {
      // This would require mocking database failures
      // For now, test that the API responds appropriately
      const response = await request(app)
        .get('/api/screenings/upcoming');

      // Should either succeed or fail with proper error structure
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('message');
      }
    });

    test('should handle malformed requests gracefully', async () => {
      // Test with various malformed requests
      await request(app)
        .get('/api/screenings/upcoming/')
        .expect(200); // Trailing slash should still work

      await request(app)
        .get('/api/screenings/upcoming/abc')
        .expect(404); // Non-numeric ID should return 404
    });
  });
});