// MySQL2 result types
export interface MySQLResultSetHeader {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

// Database row types
export interface MovieRow {
  movie_id: number;
  title: string;
  poster_img_name: string;
  description: string;
  age_rating: string;
  is_team_pick: boolean;
  score: number | null;
  length: number;
  created_at: string;
  isDeleted: boolean;
  genres_names?: string | null;
  genres_ids?: string | null;
}

export interface UserRow {
  user_id: number;
  user_name: string;
  user_email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  isVerified: boolean;
  refresh_token_version: number;
  created_at: string;
}

export interface GenreRow {
  genre_id: number;
  genre_name: string;
}

export interface ScreeningRow {
  screening_id: number;
  movie_id: number;
  cinema_id: number;
  room_id: number;
  start_date: string;
  start_time: string;
  end_time: string;
  isDeleted: boolean;
}

export interface CinemaRow {
  cinema_id: number;
  cinema_name: string;
  cinema_adresse: string; // Keep typo for DB consistency
  isDeleted: boolean;
}

export interface RoomRow {
  room_id: number;
  room_name: string;
  room_capacity: number;
  isDeleted: boolean;
  cinema_id: number;
}

export interface SeatRow {
  seat_id: number;
  seat_number: number;
  isAccesible: boolean; // Keep typo for DB consistency
  isDeleted: boolean;
  room_id: number;
}

export interface TicketRow {
  ticket_id: number;
  ticket_type_id: number;
  screening_id: number;
  user_id: number;
  seat_id: number;
  QR_code: string;
  created_at: string;
}

export interface TicketTypeRow {
  ticket_type_id: number;
  ticket_type_name: string;
  ticket_type_price: number;
}

export interface QualityRow {
  quality_id: number;
  quality_name: string;
}

export interface ReviewRow {
  review_id: number;
  movie_id: number;
  user_id: number;
  score: number;
  review: string;
  created_at: string;
}

export interface RoleRow {
  role_id: number;
  role_name: string;
}

// JWT Payload Types
export interface AccessTokenPayload {
  user_id: number;
  role_id: number;
  role_name: string;
  type: 'access_token';
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  user_id: number;
  token_version: number;
  type: 'refresh_token';
  iat: number;
  exp: number;
}

export interface EmailVerificationPayload {
  user_id: number;
  type: 'email_verification';
  iat: number;
  exp: number;
}

export interface PasswordResetPayload {
  user_id: number;
  type: 'password_reset';
  iat: number;
  exp: number;
}

// Request body types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateMovieRequest {
  title: string;
  poster_img_name: string;
  description: string;
  age_rating: string;
  is_team_pick: boolean;
  length: number;
  genres?: number[];
}

export interface UpdateMovieRequest {
  title?: string;
  poster_img_name?: string;
  description?: string;
  age_rating?: string;
  is_team_pick?: boolean;
  score?: number;
  length?: number;
  genres?: number[];
}

export interface CreateScreeningRequest {
  movie_id: number;
  cinema_id: number;
  room_id: number;
  start_date: string;
  start_time: string;
  end_time: string;
  qualities?: number[];
}

export interface CreateCinemaRequest {
  cinema_name: string;
  cinema_adresse: string; // Keep typo for consistency
}

export interface CreateRoomRequest {
  room_name: string;
  room_capacity: number;
  cinema_id: number;
}

export interface BookTicketsRequest {
  screening_id: number;
  seats: number[];
  ticket_type_id: number;
}
