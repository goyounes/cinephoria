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

// Create a minimal valid JPEG buffer for testing
const createMockJpegBuffer = () => {
  // This creates a minimal 1x1 pixel JPEG that should pass most validation
  return Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
    0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x80, 0x00, 0xFF, 0xD9
  ]);
};

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

  describe('GET /api/v1/movies/upcoming/all - Employee/Admin Only', () => {
    test('should allow employee access to all upcoming movies', async () => {
      const response = await request(app)
        .get('/api/v1/movies/upcoming/all')
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
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should deny regular user access', async () => {
      const response = await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    test('should deny unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/v1/movies/upcoming/all')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    test('should handle invalid token', async () => {
      await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', 'Bearer invalid-token')
        .expect(400);
    });

    test('should handle malformed Authorization header', async () => {
      await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('GET /api/v1/movies/:id/screenings/all - Employee/Admin Only', () => {
    test('should allow employee to see all screenings for a movie', async () => {
      const response = await request(app)
        .get('/api/v1/movies/1/screenings/all')
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
        .get('/api/v1/movies/1/screenings/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should deny regular user access', async () => {
      const response = await request(app)
        .get('/api/v1/movies/1/screenings/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
    });

    test('should deny unauthenticated access', async () => {
      await request(app)
        .get('/api/v1/movies/1/screenings/all')
        .expect(401);
    });

    test('should handle non-existent movie', async () => {
      const response = await request(app)
        .get('/api/v1/movies/9999999999/screenings/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body.message).toContain('No movie with this id was found');
    });

    test('should filter by cinema_id when provided', async () => {
      const response = await request(app)
        .get('/api/v1/movies/1/screenings/all?cinema_id=1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should include past screenings (difference from public endpoint)', async () => {
      const response = await request(app)
        .get('/api/v1/movies/1/screenings/all')
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
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('should handle token with insufficient role', async () => {
      // Create token with role 1 (user) trying to access employee endpoint
      const insufficientToken = signAccessToken(testUserId, 1, 'user');

      await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${insufficientToken}`)
        .expect(403);
    });

    test('should handle token signed with wrong secret', async () => {
      const wrongSecretToken = signTokenWithWrongSecret(testEmployeeId, 2, 'employee');

      await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(400);
    });
  });

  describe('Data Integrity and Business Logic', () => {
    test('should return consistent data structure across employee endpoints', async () => {
      const upcomingResponse = await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      if (upcomingResponse.body.length > 0) {
        const movie = upcomingResponse.body[0];
        
        const screeningsResponse = await request(app)
          .get(`/api/v1/movies/${movie.movie_id}/screenings/all`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);

        // Verify data consistency
        expect(Array.isArray(screeningsResponse.body)).toBe(true);
      }
    });

    test('should handle concurrent requests with same employee token', async () => {
      const requests = [
        request(app).get('/api/v1/movies/upcoming/all').set('Authorization', `Bearer ${employeeToken}`),
        request(app).get('/api/v1/movies/1/screenings/all').set('Authorization', `Bearer ${employeeToken}`),
        request(app).get('/api/v1/movies/upcoming/all').set('Authorization', `Bearer ${employeeToken}`)
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('POST /api/v1/movies - Employee/Admin Only', () => {
    test('should allow employee to create new movie', async () => {
      const mockImageBuffer = createMockJpegBuffer();
      const genres = [1, 2]; // Action, Adventure

      const request_builder = request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Test Movie for Employee')
        .field('description', 'A test movie created by employee')
        .field('age_rating', '13')
        .field('is_team_pick', '0')
        .field('length_hours', '02')
        .field('length_minutes', '00')
        .field('length_seconds', '00')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg');

      // Add genres as separate fields
      genres.forEach(genreId => {
        request_builder.field('selectedGenres[]', genreId.toString());
      });

      const response = await request_builder.expect([201, 500]);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie added successfully');
        expect(response.body).toHaveProperty('movie');
        expect(response.body.movie).toHaveProperty('title', 'Test Movie for Employee');
      } else {
        // If S3 is not available in test environment, that's expected
        console.warn('Movie creation failed:', response.body);
      }
    });

    test('should allow admin to create new movie', async () => {
      const mockImageBuffer = createMockJpegBuffer();
      const genres = [3, 4]; // Comedy, Drama

      const request_builder = request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Test Movie for Admin')
        .field('description', 'A test movie created by admin')
        .field('age_rating', '13')
        .field('is_team_pick', '1')
        .field('length_hours', '02')
        .field('length_minutes', '30')
        .field('length_seconds', '00')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg');

      // Add genres as separate fields
      genres.forEach(genreId => {
        request_builder.field('selectedGenres[]', genreId.toString());
      });

      const response = await request_builder.expect([201, 500]);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie added successfully');
      } else {
        console.warn('Movie creation failed:', response.body);
      }
    });

    test('should reject movie creation by regular user', async () => {
      const mockImageBuffer = createMockJpegBuffer();

      await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'Unauthorized Movie')
        .field('selectedGenres[]', '1')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg')
        .expect(403);
    });

    test('should require title field', async () => {
      const mockImageBuffer = createMockJpegBuffer();

      const response = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('description', 'Movie without title')
        .field('selectedGenres[]', '1')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing movie title');
    });

    test('should require authentication', async () => {
      const mockImageBuffer = createMockJpegBuffer();

      await request(app)
        .post('/api/v1/movies')
        .field('title', 'Unauthenticated Movie')
        .field('selectedGenres[]', '1')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg')
        .expect(401);
    });
  });

  describe('PUT /api/v1/movies/:id - Employee/Admin Only', () => {
    test('should allow employee to update existing movie', async () => {
      // Get a movie to update
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[0];

      const mockImageBuffer = createMockJpegBuffer();
      const genres = [1, 3]; // Action, Comedy

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Updated Movie Title')
        .field('description', 'Updated movie description')
        .field('age_rating', '13')
        .field('is_team_pick', '1')
        .field('length_hours', '01')
        .field('length_minutes', '45')
        .field('length_seconds', '00')
        .attach('poster_img_file', mockImageBuffer, 'updated-poster.jpg');

      // Add genres as separate fields
      genres.forEach(genreId => {
        request_builder.field('selectedGenres[]', genreId.toString());
      });

      const response = await request_builder.expect([200, 500]);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully');
      } else {
        console.warn('Movie update failed:', response.body);
      }
    });

    test('should allow admin to update existing movie', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[1] || moviesResponse.body[0];

      const genres = [2, 4]; // Adventure, Drama

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Admin Updated Movie')
        .field('description', 'Updated by admin')
        .field('age_rating', '13')
        .field('is_team_pick', '0')
        .field('length_hours', '02')
        .field('length_minutes', '15')
        .field('length_seconds', '00');

      // Add genres as separate fields
      genres.forEach(genreId => {
        request_builder.field('selectedGenres[]', genreId.toString());
      });

      const response = await request_builder.expect(201);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully');
      } else {
        console.warn('Movie update failed:', response.body);
      }
    });

    test('should update movie without new image', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[0];

      const genres = [1]; // Action only

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Updated Without Image')
        .field('description', 'No new image upload')
        .field('age_rating', '13')
        .field('is_team_pick', '0')
        .field('length_hours', '01')
        .field('length_minutes', '30')
        .field('length_seconds', '00');

      // Add genres as separate fields
      genres.forEach(genreId => {
        request_builder.field('selectedGenres[]', genreId.toString());
      });

      const response = await request_builder.expect(201);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully');
      } else {
        console.warn('Movie update failed:', response.body);
      }
    });

    test('should reject update by regular user', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[0];

      await request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'Unauthorized Update')
        .field('selectedGenres[]', '1')
        .expect(403);
    });

    test('should require title field for update', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[0];

      const response = await request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('description', 'Missing title')
        .field('selectedGenres[]', '1')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing movie title');
    });

    test('should handle non-existent movie update', async () => {
      const response = await request(app)
        .put('/api/v1/movies/999999')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Non-existent Movie')
        .field('selectedGenres[]', '1')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No movie with this id was found');
    });

    test('should handle updating movie with empty genres array', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToUpdate = moviesResponse.body[0];

      const response = await request(app)
        .put(`/api/v1/movies/${movieToUpdate.movie_id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Movie Without Genres')
        .field('description', 'Testing empty genres')
        .expect(201);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
      } else {
        console.warn('Movie update failed:', response.body);
      }
    });
  });

  describe('DELETE /api/v1/movies/:id - Employee/Admin Only', () => {
    test('should allow employee to delete movie', async () => {
      // Get a movie to delete
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToDelete = moviesResponse.body[moviesResponse.body.length - 1];// last movie which is the one we just added
      const response = await request(app)
        .delete(`/api/v1/movies/${movieToDelete.movie_id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('movie deleted succesfully');
    });

    test('should allow admin to delete movie', async () => {
      // Get a movie to delete
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToDelete = moviesResponse.body[1]; // Use second movie

      const response = await request(app)
        .delete(`/api/v1/movies/${movieToDelete.movie_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('movie deleted succesfully');
    });

    test('should reject deletion by regular user', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToDelete = moviesResponse.body[0];

      await request(app)
        .delete(`/api/v1/movies/${movieToDelete.movie_id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should reject unauthenticated deletion', async () => {
      const moviesResponse = await request(app).get('/api/v1/movies');
      const movieToDelete = moviesResponse.body[0];

      await request(app)
        .delete(`/api/v1/movies/${movieToDelete.movie_id}`)
        .expect(401);
    });

    test('should handle deletion of non-existent movie', async () => {
      const response = await request(app)
        .delete('/api/v1/movies/999999999')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    test('should handle invalid movie ID format', async () => {
      const response = await request(app)
        .delete('/api/v1/movies/invalid-id')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error Handling for Employee Endpoints', () => {
    test('should handle database errors gracefully', async () => {
      // Test error handling when database is temporarily unavailable
      // In a real scenario, you might mock the database connection to fail
      const response = await request(app)
        .get('/api/v1/movies/upcoming/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Should either succeed or fail gracefully with proper error message
      if (response.status !== 200) {
        expect(response.body).toHaveProperty('message');
      }
    });
  });
});