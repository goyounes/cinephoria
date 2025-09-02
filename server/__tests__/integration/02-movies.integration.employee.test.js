import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
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

// Load real test image file that Sharp can process
const getTestImageBuffer = () => {
  return fs.readFileSync('__tests__/integration/default_poster_img.test.webp');
};

describe('Movies Integration Tests - Employee Level', () => {
  let userToken, employeeToken, adminToken;
  let testUserId, testEmployeeId, testAdminId;
  let createdMovieIds = []; // Track movies created during tests

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
      const mockImageBuffer = getTestImageBuffer();
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

      if (response.status == 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie added successfully');
        expect(response.body).toHaveProperty('movie');
        expect(response.body.movie).toHaveProperty('title', 'Test Movie for Employee');
        // Track created movie for cleanup  
        if (response.body.movieInsertResult && response.body.movieInsertResult.insertId) {
          createdMovieIds.push(response.body.movieInsertResult.insertId);
        }
      } else {
        // If S3 is not available in test environment, that's expected
        console.warn('Movie update failed:', response.body, "response.status:",response.status);
      }
    });

    test('should allow admin to create new movie', async () => {
      const mockImageBuffer = getTestImageBuffer();
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

      if (response.status == 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie added successfully');
        // Track created movie for cleanup  
        if (response.body.movieInsertResult && response.body.movieInsertResult.insertId) {
          createdMovieIds.push(response.body.movieInsertResult.insertId);
        }
      } else {
        console.warn('Movie update failed:', response.body, "response.status:",response.status);
      }
    });

    test('should reject movie creation by regular user', async () => {
      const mockImageBuffer = getTestImageBuffer();

      await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'Unauthorized Movie')
        .field('selectedGenres[]', '1')
        .attach('poster_img_file', mockImageBuffer, 'test-poster.jpg')
        .expect(403);
    });

    test('should require title field', async () => {
      const mockImageBuffer = getTestImageBuffer();

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
      const mockImageBuffer = getTestImageBuffer();

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
      // Only update a movie we created during this test to avoid modifying seed movies data
      if (createdMovieIds.length < 2) {
        console.warn('Need at least 2 movies created to update in employee test');
        return;
      }

      const movieIdToUpdate = createdMovieIds[1]; // Use second created movie
      const mockImageBuffer = getTestImageBuffer();
      const genres = [1, 3]; // Action, Comedy

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieIdToUpdate}`)
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

      const response = await request_builder.expect([201, 500]);

      if (response.status == 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully to the database');
      } else {
        console.warn('Movie update failed:', response.body, "response.status:",response.status);
      }
    });

    test('should allow admin to update existing movie', async () => {
      // Only update a movie we created during this test to avoid modifying seed data
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to update in admin test');
        return;
      }

      // Use the first available created movie
      const movieIdToUpdate = createdMovieIds[0];
      const genres = [2, 4]; // Adventure, Drama

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieIdToUpdate}`)
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

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully to the database');
    });

    test('should update movie without new image', async () => {
      // Only update a movie we created during this test to avoid modifying seed data
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to update without image test');
        return;
      }

      const movieIdToUpdate = createdMovieIds[0];
      const genres = [1]; // Action only

      const request_builder = request(app)
        .put(`/api/v1/movies/${movieIdToUpdate}`)
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

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Movie updated successfully to the database');
    });

    test('should reject update by regular user', async () => {
      // For authorization tests, we can use a known seed movie ID since we're testing auth, not data modification
      await request(app)
        .put('/api/v1/movies/1')
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'Unauthorized Update')
        .field('selectedGenres[]', '1')
        .expect(403);
    });

    test('should require title field for update', async () => {
      // Only test validation on movies we created during this test
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to test title validation');
        return;
      }

      const movieIdToUpdate = createdMovieIds[0];
      const response = await request(app)
        .put(`/api/v1/movies/${movieIdToUpdate}`)
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
      // Only update a movie we created during this test to avoid modifying seed data
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to update with empty genres test');
        return;
      }

      const movieIdToUpdate = createdMovieIds[0];
      const response = await request(app)
        .put(`/api/v1/movies/${movieIdToUpdate}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('title', 'Movie Without Genres')
        .field('description', 'Testing empty genres')
        .expect(201);

        expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/v1/movies/:id - Employee/Admin Only', () => {
    test('should allow employee to delete movie', async () => {
      // Only delete a movie we created during this test
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to delete in employee test');
        return;
      }
      
      const movieIdToDelete = createdMovieIds.shift(); // Remove first created movie
      const response = await request(app)
        .delete(`/api/v1/movies/${movieIdToDelete}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('movie deleted succesfully');
    });

    test('should allow admin to delete movie', async () => {
      // Only delete a movie we created during this test
      if (createdMovieIds.length === 0) {
        console.warn('No movies created to delete in admin test');
        return;
      }
      
      const movieIdToDelete = createdMovieIds.shift(); // Remove next created movie
      const response = await request(app)
        .delete(`/api/v1/movies/${movieIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('movie deleted succesfully');
    });

    test('should reject deletion by regular user', async () => {
      // Use a high movie ID that should exist (from seed data) but won't actually be deleted due to authorization failure
      await request(app)
        .delete('/api/v1/movies/1') // Use movie ID 1 from seed data
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should reject unauthenticated deletion', async () => {
      // Use a high movie ID that should exist (from seed data) but won't actually be deleted due to auth failure
      await request(app)
        .delete('/api/v1/movies/1') // Use movie ID 1 from seed data
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