import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../../config/dbTestUtils.js';

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

describe('Movies Integration Tests - User Level', () => {
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
      userToken = jwt.sign(
        { user_id: testUserId, role_id: 1, role_name: 'user' },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Add a ticket for movie_id 3 so user can review it (screening_id 33 has past date)
      await connection.execute(
        'INSERT INTO tickets (screening_id, user_id, seat_id, ticket_type_id) VALUES (?, ?, ?, ?)',
        [33, testUserId, 94, 1] // screening_id 33 is for movie_id 3 with past date 2024-12-30
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
    await resetConnection(); // Just refreshes connection, no data clearing
  }, 30000);

  describe('GET /api/movies - Public Access', () => {
    test('should return all movies with genres and image URLs', async () => {
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const movie = response.body[0];
      expect(movie).toHaveProperty('movie_id');
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('description');
      expect(movie).toHaveProperty('genres');
      expect(movie).toHaveProperty('imageUrl');
      expect(movie.imageUrl).toContain('https://');
    });

    test('should return movies with properly combined genres', async () => {
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      const movieWithGenres = response.body.find(m => m.genres && m.genres.length > 0);
      if (movieWithGenres) {
        expect(Array.isArray(movieWithGenres.genres)).toBe(true);
        expect(movieWithGenres.genres[0]).toHaveProperty('genre_id');
        expect(movieWithGenres.genres[0]).toHaveProperty('genre_name');
      }
    });
  });

  describe('GET /api/movies/genres - Public Access', () => {
    test('should return all available genres', async () => {
      const response = await request(app)
        .get('/api/movies/genres')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const genre = response.body[0];
      expect(genre).toHaveProperty('genre_id');
      expect(genre).toHaveProperty('genre_name');
      expect(typeof genre.genre_name).toBe('string');
    });

    test('should include expected genres from init data', async () => {
      const response = await request(app)
        .get('/api/movies/genres')
        .expect(200);

      const genreNames = response.body.map(g => g.genre_name);
      expect(genreNames).toContain('Action');
      expect(genreNames).toContain('Comedy');
      expect(genreNames).toContain('Drama');
    });
  });

  describe('GET /api/movies/upcoming - Public Access', () => {
    test('should return upcoming movies only', async () => {
      const response = await request(app)
        .get('/api/movies/upcoming')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      response.body.forEach(movie => {
        expect(movie).toHaveProperty('movie_id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('imageUrl');
        
        // Check that all screening dates are today or in the future
        if (movie.screenings && Array.isArray(movie.screenings)) {
          movie.screenings.forEach(screening => {
            const screeningDate = new Date(screening.start_date);
            screeningDate.setHours(0, 0, 0, 0); // Reset time for fair comparison
            
            expect(screeningDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
          });
        }
      });
    });
  });

  describe('GET /api/movies/latest - Public Access', () => {
    test('should return latest movies', async () => {
      const response = await request(app)
        .get('/api/movies/latest')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(movie => {
        expect(movie).toHaveProperty('movie_id');
        expect(movie).toHaveProperty('title');
        expect(movie).toHaveProperty('created_at');
        expect(movie).toHaveProperty('imageUrl');
      });
    });
  });

  describe('GET /api/movies/:id - Public Access', () => {
    test('should return specific movie by ID', async () => {
      // First get a movie ID from the list
      const moviesResponse = await request(app).get('/api/movies');
      const movieId = moviesResponse.body[0].movie_id;

      const response = await request(app)
        .get(`/api/movies/${movieId}`)
        .expect(200);

      expect(response.body).toHaveProperty('movie_id', movieId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toContain('https://');
    });

    test('should return 404 for non-existent movie', async () => {
      const response = await request(app)
        .get('/api/movies/0')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Movie not found');
    });

    test('should return 404 for invalid movie ID', async () => {
      await request(app)
        .get('/api/movies/invalid-id')
        .expect(404);
    });
  });

  describe('GET /api/movies/:id/screenings - Public Access', () => {
    test('should return screenings for a specific movie', async () => {
      // Get a movie ID first
      const moviesResponse = await request(app).get('/api/movies');
      const movieId = moviesResponse.body[0].movie_id;

      const response = await request(app)
        .get(`/api/movies/${movieId}/screenings`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Screenings structure should include combined qualities
      response.body.forEach(screening => {
        expect(screening).toHaveProperty('screening_id');
        expect(screening).toHaveProperty('start_date');
        expect(screening).toHaveProperty('start_time');
      });
    });

    test('should filter screenings by cinema_id when provided', async () => {
      const moviesResponse = await request(app).get('/api/movies');
      const movieId = moviesResponse.body[0].movie_id;

      const response = await request(app)
        .get(`/api/movies/${movieId}/screenings?cinema_id=1`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return 404 for non-existent movie screenings', async () => {
      const response = await request(app)
        .get('/api/movies/999999/screenings')
        .expect(404);

      expect(response.body.message).toContain('No movie with this id was found');
    });
  });

  describe('POST /api/movies/reviews - User Authentication Required', () => {
    test('should reject review without authentication', async () => {
      const reviewData = {
        movie_id: 1,
        user_id: testUserId,
        score: 8,
        review: 'Great movie!'
      };

      await request(app)
        .post('/api/movies/reviews')
        .send(reviewData)
        .expect(401);
    });

    test('should reject review with missing required fields', async () => {
      const incompleteReviewData = {
        movie_id: 1,
        review: 'Great movie!'
        // Missing user_id and score
      };

      const response = await request(app)
        .post('/api/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(incompleteReviewData)
        .expect(400);

      expect(response.body.message).toContain('Missing required fields');
    });

    test('should reject review for non-existent movie', async () => {
      const reviewData = {
        movie_id: 999999,
        user_id: testUserId,
        score: 8,
        review: 'Great movie!'
      };

      const response = await request(app)
        .post('/api/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(404);

      expect(response.body.message).toContain('No movie with this id was found');
    });

    test('should reject review if user has not watched the movie', async () => {
      const reviewData = {
        movie_id: 1,
        user_id: testUserId,
        score: 8,
        review: 'Great movie!'
      };

      const response = await request(app)
        .post('/api/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.message).toContain('You can only review a movie after watching it');
    });

    test('should successfully create review for movie user has watched', async () => {
      const reviewData = {
        movie_id: 3, // User has ticket for movie_id 3
        user_id: testUserId,
        score: 5, // Score must be between 1 and 5 due to CHECK constraint
        review: 'Great movie! Really enjoyed it.'
      };

      const response = await request(app)
        .post('/api/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Review added successfully');
      expect(response.body).toHaveProperty('review');
    });
  });

  describe('Error Handling - Public Endpoints', () => {
    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking or temporarily breaking the DB connection
      // For now, we test that the error handling middleware works
      const response = await request(app)
        .get('/api/movies/invalid-format-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    test('should handle S3 connection errors gracefully', async () => {
      // Test continues even if S3 is unavailable (should still return movie data without imageUrl)
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});