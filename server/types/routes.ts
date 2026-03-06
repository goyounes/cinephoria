// Common route parameter and query interfaces

// Route parameters
export interface IdParam extends Record<string, string> {
  id: string;
}

// Query parameters
export interface CinemaIdQuery {
  cinema_id?: string;
}

// Request body types for movies
export interface MovieCreateBody {
  title: string;
  description?: string;
  age_rating?: number;
  is_team_pick?: number;
  length_hours?: string;
  length_minutes?: string;
  length_seconds?: string;
  selectedGenres?: number[];
}

export interface MovieUpdateBody extends MovieCreateBody {
  // Same as create for now
}

// Request body types for screenings
export interface ScreeningCreateBody {
  movie_id: number;
  cinema_id: number;
  room_ids: number[];
  start_date: string;
  start_time: string;
  end_time: string;
}

export interface ScreeningUpdateBody {
  movie_id: number;
  cinema_id: number;
  room_id: number;
  start_date: string;
  start_time: string;
  end_time: string;
}

// Request body types for auth
export interface RegisterBody {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ResetPasswordRequestBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

// Request body types for users
export interface CreateUserBody {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role_id: number;
}

// Request body types for reviews
export interface ReviewCreateBody {
  movie_id: number;
  score: number;
  review?: string;
}

// Request body types for checkout
export interface CheckoutTicketType {
  type_id: number;
  count: number;
  ticket_type_price: number;
}

export interface CheckoutBody {
  screening_id: number;
  ticket_types: CheckoutTicketType[];
  total_price: number;
}

// Request body types for cinema
export interface CinemaCreateBody {
  cinema_name: string;
  cinema_adresse: string;
}

export interface CinemaUpdateBody extends CinemaCreateBody {
  // Same as create for now
}
