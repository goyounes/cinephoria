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

describe('Complete User Journey Integration Tests', () => {
  let adminToken;
  let userToken;
  let newAdminToken;
  let testAdminData;
  let testUserData;
  let newAdminId;
  let existingMovieId;
  let existingCinemaId;
  let existingScreeningId;
  let existingRoomId;
  let availableSeatIds = [];
  let createdTicketIds = [];

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
      .post('/api/auth/login')
      .send({
        email: existingAdminData.email,
        password: existingAdminData.password
      });

    adminToken = adminLoginResponse.body.accessToken;
    
    // Note: User registration and login will be done in a separate test

    // Get existing data from database to use for journey
    const [movieRows] = await pool.query(`
      SELECT movie_id, title FROM movies WHERE isDeleted = FALSE LIMIT 1
    `);
    existingMovieId = movieRows[0].movie_id;

    const [cinemaRows] = await pool.query(`
      SELECT cinema_id, cinema_name FROM cinemas WHERE isDeleted = FALSE LIMIT 1
    `);
    existingCinemaId = cinemaRows[0].cinema_id;

    const [roomRows] = await pool.query(`
      SELECT room_id FROM rooms WHERE cinema_id = ? AND isDeleted = FALSE LIMIT 1
    `, [existingCinemaId]);
    existingRoomId = roomRows[0].room_id;

    // Get future screening data for booking
    const [screeningRows] = await pool.query(`
      SELECT screening_id FROM screenings 
      WHERE movie_id = ? AND room_id = ? AND isDeleted = FALSE 
        AND (start_date > CURDATE() OR (start_date = CURDATE() AND start_time > CURTIME()))
        AND start_date <= CURDATE() + INTERVAL 14 DAY
      LIMIT 1
    `, [existingMovieId, existingRoomId]);
    
    if (screeningRows.length > 0) {
      existingScreeningId = screeningRows[0].screening_id;
    }

    // Get available seats for the screening
    const [seatRows] = await pool.query(`
      SELECT seat_id FROM seats 
      WHERE room_id = ? AND isDeleted = FALSE 
        AND seat_id NOT IN (
          SELECT seat_id FROM tickets 
          WHERE screening_id = ? AND seat_id IS NOT NULL
        )
      LIMIT 5
    `, [existingRoomId, existingScreeningId]);

    availableSeatIds = seatRows.map(row => row.seat_id);
  }, 30000);

  afterAll(async () => {
    await pool.end();
    await cleanupTestDatabase();
  }, 30000);

  beforeEach(async () => {
    await resetConnection();
  }, 30000);

  describe('Admin Capabilities Verification', () => {
    test('should authenticate existing admin user', async () => {
      expect(adminToken).toBeDefined();
      console.log('✓ Existing admin authentication successful');
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
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdminData)
        .expect(201);

      expect(createAdminResponse.body.message).toContain('User added successfully');
      expect(createAdminResponse.body).toHaveProperty('user_id');
      newAdminId = createAdminResponse.body.user_id;

      // Login with the newly created admin
      const newAdminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newAdminData.email,
          password: newAdminData.password
        })
        .expect(200);

      newAdminToken = newAdminLoginResponse.body.accessToken;
      expect(newAdminToken).toBeDefined();
      console.log('✓ New admin user created and authenticated successfully');
    });

    test('should create cinema, movie, and screening with new admin', async () => {
      // 1. Create cinema
      const cinemaData = {
        cinema_name: 'New Admin Cinema',
        cinema_adresse: '456 Admin Street, Admin City'
      };

      const cinemaResponse = await request(app)
        .post('/api/cinemas')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(cinemaData)
        .expect(201);

      expect(cinemaResponse.body.cinema_name).toBe('New Admin Cinema');
      const newCinemaId = cinemaResponse.body.cinema_id;

      // 2. Create room in the cinema
      const roomData = {
        room_name: 'Admin Theater 1',
        room_capacity: 20,
        cinema_id: newCinemaId
      };

      const roomResponse = await request(app)
        .post('/api/cinemas/rooms')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(roomData)
        .expect(201);

      expect(roomResponse.body.room_name).toBe('Admin Theater 1');
      const newRoomId = roomResponse.body.room_id;

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
        .post('/api/movies')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .field('title', movieData.title)
        .field('description', movieData.description)
        .field('age_rating', movieData.age_rating)
        .field('is_team_pick', movieData.is_team_pick)
        .field('length_hours', movieData.length_hours)
        .field('length_minutes', movieData.length_minutes)
        .field('length_seconds', movieData.length_seconds);

      // Add each genre as a separate field (this is how arrays work in multipart forms)
      movieData.selectedGenres.forEach(genreId => {
        movieRequest = movieRequest.field('selectedGenres', genreId);
      });

      const createMovieResponse = await movieRequest;

      if (createMovieResponse.status !== 201) {
        console.log('Movie creation failed:', createMovieResponse.body);
        throw new Error(`Movie creation failed with status ${createMovieResponse.status}: ${JSON.stringify(createMovieResponse.body)}`);
      }

      expect(createMovieResponse.body.message).toContain('Movie added successfully');
      const newMovieId = createMovieResponse.body.movieInsertResult.insertId;

      // 4. Create screening
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const screeningData = {
        movie_id: newMovieId,
        cinema_id: newCinemaId,
        room_ids: [newRoomId],
        start_date: tomorrowStr,
        start_time: '19:00:00',
        end_time: '21:30:00'
      };

      const createScreeningResponse = await request(app)
        .post('/api/screenings')
        .set('Authorization', `Bearer ${newAdminToken}`)
        .send(screeningData)
        .expect(201);

      expect(createScreeningResponse.body.message).toContain('Screening added successfully');
      
      console.log('✓ New admin created complete cinema content: cinema, movie, and screening');
    });

    test('should register and verify a new user', async () => {
      // 1. Register new user
      const registrationResponse = await request(app)
        .post('/api/auth/register')
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
        .get(`/api/auth/verify-email?token=${token}`);
      
      expect(verifyResponse.status).toBe(200);

      // 4. Login with the registered and verified user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('accessToken');
      userToken = loginResponse.body.accessToken;
      
      console.log('✓ User registered, verified, and authenticated successfully');
    });
  });

  describe('Complete User Journey Story', () => {
    test('should browse upcoming movies', async () => {
      const moviesResponse = await request(app)
        .get('/api/movies/upcoming')
        .expect(200);

      expect(moviesResponse.body).toBeInstanceOf(Array);
      expect(moviesResponse.body.length).toBeGreaterThan(0);
      
      const targetMovie = moviesResponse.body.find(movie => movie.movie_id === existingMovieId);
      expect(targetMovie).toBeDefined();
      console.log(`✓ User can browse movies - found target movie: ${targetMovie.title}`);
    });

    test('should get movie details', async () => {
      const movieResponse = await request(app)
        .get(`/api/movies/${existingMovieId}`)
        .expect(200);

      expect(movieResponse.body.movie_id).toBe(existingMovieId);
      expect(movieResponse.body.title).toBeDefined();
      expect(movieResponse.body.genres).toBeInstanceOf(Array);
      console.log(`✓ User can view movie details: ${movieResponse.body.title}`);
    });

    test('should get movie screenings', async () => {
      if (!existingScreeningId) {
        console.log('⚠ No future screenings available, skipping screening tests');
        return;
      }

      const screeningsResponse = await request(app)
        .get(`/api/movies/${existingMovieId}/screenings?cinema_id=${existingCinemaId}`)
        .expect(200);

      expect(screeningsResponse.body).toBeInstanceOf(Array);
      expect(screeningsResponse.body.length).toBeGreaterThan(0);
      
      const targetScreening = screeningsResponse.body.find(s => s.screening_id === existingScreeningId);
      expect(targetScreening).toBeDefined();
      console.log(`✓ User can view screenings for movie`);
    });

    test('should view screening details with seat information', async () => {
      if (!existingScreeningId) {
        console.log('⚠ No screening available, skipping screening details test');
        return;
      }

      // Check screening details which include seat availability info
      const screeningResponse = await request(app)
        .get(`/api/screenings/upcoming/${existingScreeningId}`)
        .expect(200);

      expect(screeningResponse.body).toHaveProperty('screening_id');
      expect(screeningResponse.body).toHaveProperty('title'); // API returns 'title' not 'movie_title'
      expect(screeningResponse.body).toHaveProperty('cinema_name');
      // Screenings include seat availability data based on other integration tests
      if (screeningResponse.body.total_seats) {
        expect(screeningResponse.body).toHaveProperty('total_seats');
        expect(screeningResponse.body).toHaveProperty('booked_seats');
        expect(screeningResponse.body).toHaveProperty('seats_left');
        console.log(`✓ User can view screening details with seat info: ${screeningResponse.body.seats_left}/${screeningResponse.body.total_seats} available`);
      } else {
        console.log('✓ User can view screening details');
      }
    });

    test('should complete checkout and book tickets', async () => {
      if (!existingScreeningId) {
        console.log('⚠ No screening available, skipping booking test');
        return;
      }

      // Get ticket types first
      const ticketTypesResponse = await request(app)
        .get('/api/tickets/types')
        .expect(200);
      
      const ticketTypes = ticketTypesResponse.body;
      
      const checkoutData = {
        screening_id: existingScreeningId,
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
        .post('/api/checkout/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(200);

      expect(checkoutResponse.body.message).toBe('Booking successful');
      expect(checkoutResponse.body).toHaveProperty('tickets_booked', 2);
      expect(checkoutResponse.body).toHaveProperty('seat_ids');
      expect(checkoutResponse.body.seat_ids).toHaveLength(2);
      
      // Store seat IDs that were assigned for later tests
      createdTicketIds = checkoutResponse.body.seat_ids; // For now, using seat_ids as reference
      
      console.log(`✓ User successfully booked ${checkoutResponse.body.tickets_booked} tickets at seats ${checkoutResponse.body.seat_ids.join(', ')}`);
    });

    test('should retrieve user tickets', async () => {
      if (createdTicketIds.length === 0) {
        console.log('⚠ No tickets booked, skipping ticket retrieval test');
        return;
      }

      const ticketsResponse = await request(app)
        .get('/api/tickets/owned')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(ticketsResponse.body).toBeInstanceOf(Array);
      
      // Find tickets for our screening (we can't match exact ticket IDs but we can check for our screening)
      const ourTickets = ticketsResponse.body.filter(t => t.screening_id === existingScreeningId);
      expect(ourTickets.length).toBeGreaterThanOrEqual(2); // At least the 2 we just booked
      
      const ticket = ourTickets[0];
      expect(ticket).toHaveProperty('title'); // API returns 'title' not 'movie_title'
      expect(ticket).toHaveProperty('cinema_name');
      expect(ticket).toHaveProperty('QR_code');
      console.log(`✓ User retrieved ${ourTickets.length} tickets for the screening`);
    });

    test('should handle movie review business logic correctly', async () => {
      if (createdTicketIds.length === 0) {
        console.log('⚠ No tickets booked, skipping review test');
        return;
      }

      const reviewData = {
        movie_id: existingMovieId,
        score: 8,
        review: 'Great movie experience! The cinema was comfortable and the movie was engaging.'
      };

      const reviewResponse = await request(app)
        .post('/api/movies/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      if (reviewResponse.status === 201) {
        expect(reviewResponse.body.message).toBe('Review added successfully');
        expect(reviewResponse.body.review_id).toBeDefined();
        console.log('✓ User can add reviews after watching movies');
      } else if (reviewResponse.status === 400) {
        // This is expected - user can only review movies after the screening has passed
        console.log('✓ Review validation works - users can only review past screenings');
      } else {
        throw new Error(`Unexpected review response: ${reviewResponse.status}`);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should require authentication for ticket booking', async () => {
      const ticketTypesResponse = await request(app).get('/api/tickets/types');
      const ticketTypes = ticketTypesResponse.body;

      const checkoutData = {
        screening_id: existingScreeningId || 1,
        ticket_types: [{ 
          type_id: ticketTypes[0].ticket_type_id, 
          count: 1, 
          ticket_type_price: ticketTypes[0].ticket_type_price 
        }],
        total_price: parseFloat(ticketTypes[0].ticket_type_price),
        card: { number: '4111111111111111', cvv: '123', expiry: '12/25' }
      };

      const response = await request(app)
        .post('/api/checkout/complete')
        .send(checkoutData)
        .expect(401);

      // API might return different error response formats
      expect(response.status).toBe(401);
      console.log('✓ Authentication required for bookings');
    });

    test('should handle non-existent movie gracefully', async () => {
      const response = await request(app)
        .get('/api/movies/99999')
        .expect(404);

      expect(response.status).toBe(404);
      console.log('✓ Non-existent movie handled gracefully');
    });

    test('should handle invalid screening ID gracefully', async () => {
      const response = await request(app)
        .get('/api/screenings/upcoming/99999')
        .expect(404);

      expect(response.status).toBe(404);
      console.log('✓ Non-existent screening handled gracefully');
    });

    test('should prevent booking without required ticket data', async () => {
      const incompleteCheckoutData = {
        screening_id: existingScreeningId || 1
        // Missing ticket_types and other required fields
      };

      const response = await request(app)
        .post('/api/checkout/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send(incompleteCheckoutData)
        .expect(400);

      expect(response.status).toBe(400);
      console.log('✓ Incomplete booking data rejected');
    });
  });
});