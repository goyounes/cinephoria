// === Core Models (API responses) ===

export interface Genre {
  genre_id: number;
  genre_name: string;
}

export interface Movie {
  movie_id: number;
  title: string;
  description: string;
  age_rating: string;
  is_team_pick: number;
  score: string;
  length: number;
  imageUrl: string;
  genres: Genre[];
  created_at: string;
  poster_img_name?: string;
  cinema_id?: number;
  start_date?: string;
}

export interface Cinema {
  cinema_id: number;
  cinema_name: string;
  cinema_adresse: string;
}

export interface Room {
  room_id: number;
  room_name: string;
  room_capacity: number;
  cinema_id: number;
}

export interface Screening {
  screening_id: number;
  movie_id: number;
  cinema_id: number;
  room_id: number;
  start_date: string;
  start_time: string;
  end_time: string;
  isDeleted?: number;
  cinema_name?: string;
  cinema_adresse?: string;
  room_name?: string;
  title?: string;
  qualities?: Quality[];
}

export interface Quality {
  quality_id: number;
  quality_name: string;
}

export interface TicketType {
  ticket_type_id: number;
  ticket_type_name: string;
  ticket_type_price: number;
}

export interface Ticket {
  ticket_id: number;
  ticket_type_id: number;
  screening_id: number;
  user_id: number;
  seat_id: number;
  seat_number: number;
  QR_code: string;
  created_at: string;
  ticket_type_name?: string;
  ticket_type_price?: number;
  title?: string;
  movie_id?: number;
  cinema_name?: string;
  room_name?: string;
  start_date?: string;
  start_time?: string;
}

export interface Review {
  review_id: number;
  movie_id: number;
  user_id: number;
  score: number;
  review: string;
  created_at: string;
  user_name?: string;
}

export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role_name: string;
  first_name?: string;
  last_name?: string;
  isVerified?: boolean;
  created_at?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
}

// === Auth Types ===

export interface CurrentUser {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role_name: string;
}

export interface LoginInputs {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role_name: string;
  accessToken: string;
}

// === Checkout Types ===

export interface OrderTicketType {
  type_id: number;
  type_name: string;
  count: number;
  ticket_type_price: number;
}

export interface Order {
  screening_id: string | null;
  ticket_types: OrderTicketType[];
  total_price: number;
}

export interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
}

// === Utility Types ===

export interface CardExpiryValidation {
  valid: boolean;
  reason?: "invalid_format" | "expired";
}

export type SnackbarSeverity = "info" | "success" | "error" | "warning";

// === Grouped Screening Types ===

export interface RoomGroup {
  room_id: number;
  room_name: string;
  screenings: Screening[];
}

export interface CinemaGroup {
  cinema_id: number;
  cinema_name: string;
  [roomId: number]: RoomGroup;
}

export interface GroupedScreeningsByDate {
  [date: string]: {
    [cinemaId: number]: CinemaGroup;
  };
}

export interface GroupedScreeningsByMovie {
  [movieId: number]: Screening[];
}

// === Filter Types ===

export interface MovieFilterOptions {
  selectedCinema?: Cinema | null;
  selectedGenres?: Genre[];
}

// === Sort Config (used by admin tables) ===

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}
