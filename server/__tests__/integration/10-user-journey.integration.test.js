import { jest } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase, resetConnection } from '../utils/dbTestUtils.js';
import dayjs from 'dayjs';
import { s3, bucketName } from '../../api/awsS3Client.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

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

describe('Complete User Journey Integration Tests', () => {
  let adminToken;
  let userToken;
  let newAdminToken;
  let testUserData;
  let newAdminId;
  let createdTicketIds = [];
  let newCinemaId, newMovieId, newScreeningId, newRoomId;
  let createdMoviePosterName;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Use existing admin from database (admin@admin.com/adminadmin)
    const existingAdminData = {
      email: 'admin@admin.com',
      password: 'adminadmin'
    };

    // Test user data for registration (role_id: 1)
    testUserData = {
      username: 'journeyuser',
      email: 'journeyuser@example.com',
      firstName: 'Journey',
      lastName: 'User',
      password: 'UserPass123!'
    };

    // Login with existing admin
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: existingAdminData.email,
        password: existingAdminData.password
      });

    adminToken = adminLoginResponse.body.accessToken;
  }, 30000);

  afterAll(async () => {
    // Clean up S3 image created during movie creation
    if (createdMoviePosterName) {
      try {
        const deleteParams = {
          Bucket: bucketName,
          Key: createdMoviePosterName,
        };
        
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      } catch (error) {
        console.warn(`Failed to cleanup S3 image ${createdMoviePosterName}:`, error.message);
      }
    }

    // Clean up database first, then close pool connection
    await cleanupTestDatabase();
    await pool.end();
  }, 30000);


  describe('Admin Capabilities Verification', () => {
    test('should authenticate existing admin user', async () => {
      expect(adminToken).toBeDefined();
    });

    test('should create a new admin user via existing admin', async () => {
      const newAdminData = {
        username: 'newjourneyadmin',
        email: 'newjourneyadmin@cinephoria.com',
        firstName: 'New',
        lastName: 'Admin',
        password: 'NewAdminPass123!',
        role_id: 3
      };

      const createAdminResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdminData)
        .expect(201);

      expect(createAdminResponse.body.message).toContain('User added successfully');
      expect(createAdminResponse.body).toHaveProperty('user_id');
      newAdminId = createAdminResponse.body.user_id;

      // Login with the newly created admin
      const newAdminLoginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: newAdminData.email,
          password: newAdminData.password
        })
        .expect(200);

      newAdminToken = newAdminLoginResponse.body.accessToken;
      expect(newAdminToken).toBeDefined();
    });

    test('should create cinema, movie, and screening with new admin', async () => {
      // 1. Create cinema
      const cinemaData = {
        cinema_name: 'New Admin Cinema',
        cinema_adresse: '456 Admin Street, Admin City'
      };

      const cinemaResponse = await request(app)
        .post('/api/v1/cinemas')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(cinemaData)
        .expect(201);

      expect(cinemaResponse.body.cinema_name).toBe('New Admin Cinema');
      newCinemaId = cinemaResponse.body.cinema_id;

      // 2. Create room in the cinema
      const roomData = {
        room_name: 'Admin Theater 1',
        room_capacity: 20,
        cinema_id: newCinemaId
      };

      const roomResponse = await request(app)
        .post('/api/v1/cinemas/rooms')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(roomData)
        .expect(201);

      expect(roomResponse.body.room_name).toBe('Admin Theater 1');
      newRoomId = roomResponse.body.room_id;

      // 3. Create movie
      const movieData = {
        title: 'New Admin Movie',
        description: 'A movie created by the new admin',
        age_rating: 13,
        is_team_pick: 1,
        length_hours: '2',
        length_minutes: '15',
        length_seconds: '00',
        selectedGenres: [1, 5, 10] // Action, Comedy, Drama
      };

      let movieRequest = request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .field('title', movieData.title)
        .field('description', movieData.description)
        .field('age_rating', movieData.age_rating)
        .field('is_team_pick', movieData.is_team_pick)
        .field('length_hours', movieData.length_hours)
        .field('length_minutes', movieData.length_minutes)
        .field('length_seconds', movieData.length_seconds);

      // Add each genre as a separate field (this is how arrays work in multipart forms) 
      // Check implementation in AdminAddCinema Component in client
      movieData.selectedGenres.forEach(genreId => {
        movieRequest = movieRequest.field('selectedGenres', genreId);
      });

      const createMovieResponse = await movieRequest;

      expect(createMovieResponse.body.message).toContain('Movie added successfully');
      newMovieId = createMovieResponse.body.movieInsertResult.insertId;
      
      // Capture the poster image name for cleanup from the response
      if (createMovieResponse.body.imageName) {
        createdMoviePosterName = createMovieResponse.body.imageName;
      }

      // 4. Create screening
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

      const screeningData = {
        movie_id: newMovieId,
        cinema_id: newCinemaId,
        room_ids: [newRoomId],
        start_date: tomorrow,
        start_time: '19:00:00',
        end_time: '21:30:00'
      };

      const createScreeningResponse = await request(app)
        .post('/api/v1/screenings')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(screeningData)
        .expect(201);

      expect(createScreeningResponse.body.message).toContain('Screening added successfully');
      
      // Store the screening ID for user journey tests
      if (createScreeningResponse.body.screeningInsertResult && createScreeningResponse.body.screeningInsertResult.insertId) {
        newScreeningId = createScreeningResponse.body.screeningInsertResult.insertId;
      } else if (createScreeningResponse.body.screeningInsertResult && Array.isArray(createScreeningResponse.body.screeningInsertResult)) {
        // If multiple screenings are created, take the first one
        newScreeningId = createScreeningResponse.body.screeningInsertResult[0]?.insertId;
      }
      
      expect(newScreeningId).toBeDefined();
    });

    test('should register and verify a new user', async () => {
      // 1. Register new user
      const registrationResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUserData);

      expect(registrationResponse.status).toBe(201);
      expect(registrationResponse.body.message).toContain('User registered successfully');
      expect(registrationResponse.body).toHaveProperty('user_id');

      // 2. Verify user in database is unverified
      const [userRows] = await pool.query(
        'SELECT user_id, user_name, user_email, isVerified FROM users WHERE user_email = ?',
        [testUserData.email]
      );
      
      expect(userRows).toHaveLength(1);
      expect(userRows[0].isVerified).toBe(0);
      
      // 3. Generate verification token and simulate clicking the email link
      const { generateEmailVerificationLink } = await import('../../utils/index.js');
      const { link, token } = generateEmailVerificationLink(userRows[0].user_id);
      
      // Extract token from link and hit the verification endpoint
      const verifyResponse = await request(app)
        .get(`/api/v1/auth/verify-email?token=${token}`);
      
      expect(verifyResponse.status).toBe(200);

      // 4. Login with the registered and verified user
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      userToken = loginResponse.body.accessToken;
      expect(userToken).toBeDefined();
    });
  });

  describe('Complete User Journey Story', () => {
    test('should browse upcoming movies', async () => {
      const moviesResponse = await request(app)
        .get('/api/v1/movies/upcoming')
        .expect(200);

      expect(moviesResponse.body).toBeInstanceOf(Array);
      expect(moviesResponse.body.length).toBeGreaterThan(0);
      
      // Find the movie created by the new admin
      const targetMovie = moviesResponse.body.find(movie => movie.movie_id === newMovieId);
      expect(targetMovie).toBeDefined();
      expect(targetMovie.title).toBe('New Admin Movie');
    });

    test('should get movie details', async () => {
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${newMovieId}`)
        .expect(200);

      expect(movieResponse.body.movie_id).toBe(newMovieId);
      expect(movieResponse.body.title).toBe('New Admin Movie');
      expect(movieResponse.body.genres).toBeInstanceOf(Array);
    });

    test('should get movie screenings', async () => {
      const screeningsResponse = await request(app)
        .get(`/api/v1/movies/${newMovieId}/screenings?cinema_id=${newCinemaId}`)
        .expect(200);

      expect(screeningsResponse.body).toBeInstanceOf(Array);
      expect(screeningsResponse.body.length).toBeGreaterThan(0);
      
      const targetScreening = screeningsResponse.body.find(s => s.screening_id === newScreeningId);
      expect(targetScreening).toBeDefined();
    });

    test('should view screening details with seat information', async () => {
      const screeningResponse = await request(app)
        .get(`/api/v1/screenings/upcoming/${newScreeningId}`)
        .expect(200);

      expect(screeningResponse.body).toHaveProperty('screening_id');
      expect(screeningResponse.body).toHaveProperty('title');
      expect(screeningResponse.body.title).toBe('New Admin Movie');
      expect(screeningResponse.body).toHaveProperty('cinema_name');
      expect(screeningResponse.body.cinema_name).toBe('New Admin Cinema');
      
      if (screeningResponse.body.total_seats) {
        expect(screeningResponse.body).toHaveProperty('total_seats');
        expect(screeningResponse.body).toHaveProperty('booked_seats');
        expect(screeningResponse.body).toHaveProperty('seats_left');
      }
    });

    test('should complete checkout and book tickets', async () => {
      const ticketTypesResponse = await request(app)
        .get('/api/v1/tickets/types')
        .expect(200);
      
      const ticketTypes = ticketTypesResponse.body;
      
      const checkoutData = {
        screening_id: newScreeningId,
        ticket_types: [
          { 
            type_id: ticketTypes[0].ticket_type_id, 
            count: 2, 
            ticket_type_price: ticketTypes[0].ticket_type_price 
          }
        ],
        total_price: 2 * parseFloat(ticketTypes[0].ticket_type_price),
        card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
      };

      const checkoutResponse = await request(app)
        .post('/api/v1/checkout/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(200);

      expect(checkoutResponse.body.message).toBe('Booking successful');
      expect(checkoutResponse.body).toHaveProperty('tickets_booked', 2);
      expect(checkoutResponse.body).toHaveProperty('seat_ids');
      expect(checkoutResponse.body.seat_ids).toHaveLength(2);
      
      createdTicketIds = checkoutResponse.body.seat_ids;
    });

    test('should retrieve user tickets', async () => {
      const ticketsResponse = await request(app)
        .get('/api/v1/tickets/owned')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(ticketsResponse.body).toBeInstanceOf(Array);
      
      const ourTickets = ticketsResponse.body.filter(t => t.screening_id === newScreeningId);
      expect(ourTickets.length).toBeGreaterThanOrEqual(2);
      
      const ticket = ourTickets[0];
      expect(ticket).toHaveProperty('title');
      expect(ticket.title).toBe('New Admin Movie');
      expect(ticket).toHaveProperty('cinema_name');
      expect(ticket.cinema_name).toBe('New Admin Cinema');
      expect(ticket).toHaveProperty('QR_code');
    });

    test('should handle movie review business logic correctly', async () => {
      const reviewData = {
        movie_id: newMovieId,
        score: 8,
        review: 'Great experience at the new admin\'s cinema! The movie was fantastic and the theater was excellent.'
      };

      const reviewResponse = await request(app)
        .post('/api/v1/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(400);

      expect(reviewResponse.body.message).toContain('You can only review a movie after watching it');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should require authentication for ticket booking', async () => {
      const ticketTypesResponse = await request(app).get('/api/v1/tickets/types');
      const ticketTypes = ticketTypesResponse.body;

      const checkoutData = {
        screening_id: newScreeningId || 1,
        ticket_types: [{ 
          type_id: ticketTypes[0].ticket_type_id, 
          count: 1, 
          ticket_type_price: ticketTypes[0].ticket_type_price 
        }],
        total_price: parseFloat(ticketTypes[0].ticket_type_price),
        card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
      };

      const response = await request(app)
        .post('/api/v1/checkout/complete')
        .send(checkoutData)
        .expect(401);

      expect(response.status).toBe(401);
    });

    test('should handle non-existent movie gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/movies/99999')
        .expect(404);

      expect(response.status).toBe(404);
    });

    test('should handle invalid screening ID gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/screenings/upcoming/99999')
        .expect(404);

      expect(response.status).toBe(404);
    });

    test('should prevent booking without required ticket data', async () => {
      const incompleteCheckoutData = {
        screening_id: newScreeningId || 1
        // Missing ticket_types and other required fields
      };

      const response = await request(app)
        .post('/api/v1/checkout/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send(incompleteCheckoutData)
        .expect(400);

      expect(response.status).toBe(400);
    });
  });
});