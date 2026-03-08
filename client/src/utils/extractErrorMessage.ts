import { AxiosError } from 'axios';

interface ValidationError {
  msg: string;
}

interface ApiErrorResponse {
  message?: string;
  status?: number;
  errors?: ValidationError[];
}

/**
 * Extracts a user-friendly error message from an API error.
 * Handles both validation errors ({ errors: [] }) and
 * standard errors ({ message, status }).
 */
export function extractErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const data = axiosError.response?.data;

  if (!data) {
    return axiosError.message || fallback;
  }

  // Validation errors: join all messages
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(e => e.msg).join(", ");
  }

  // Standard error
  if (data.message) {
    return data.message;
  }

  return axiosError.message || fallback;
}
