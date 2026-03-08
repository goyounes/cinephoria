# Unified Error Handling

## Overview

This document describes the standardized error handling system between the server API responses and the client-side error extraction logic.

## Server Error Response Formats

The server uses exactly **2 error response shapes**:

### 1. Validation Errors (HTTP 400)

Returned when express-validator catches invalid input (e.g., bad email format, missing fields).

```json
{
  "errors": [
    {
      "type": "field",
      "value": "bad-email",
      "msg": "Invalid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Source**: `server/utils/responses.ts` — `respondWithError()` handling `ValidationError`

### 2. Standard Errors (HTTP 400–500)

Returned for all other errors: authentication failures, not found, forbidden, rate limits, server errors, etc.

```json
{
  "message": "Human-readable error message",
  "status": 401
}
```

**Source**: `server/utils/responses.ts` — `respondWithError()` handling `AppError` and generic `Error`

### Error Classes

Defined in `server/utils/errors.ts`:

| Class | Status Code | Default Message |
|---|---|---|
| `BadRequestError` | 400 | "Bad request" |
| `UnauthorizedError` | 401 | "Unauthorized" |
| `ForbiddenError` | 403 | "Access denied" |
| `NotFoundError` | 404 | "Not found" |
| `ConflictError` | 409 | "Conflict" |
| `GoneError` | 410 | "Resource expired" |
| `ValidationError` | 400 | "Validation failed" (+ errors array) |

Rate limiting (`server/middleware/rateLimiters.ts`) also uses the standard shape: `{ message: "Rate limit exceeded", status: 429 }`.

---

## Client Error Extraction

### The `extractErrorMessage` Utility

**File**: `client/src/utils/extractErrorMessage.ts`

A single function that handles both server error shapes and returns a user-friendly string:

```typescript
import { extractErrorMessage } from '../utils/extractErrorMessage';

// Basic usage
catch (error: unknown) {
  showSnackbar(extractErrorMessage(error), "error");
}

// With custom fallback
catch (error: unknown) {
  showSnackbar(extractErrorMessage(error, "Reset failed"), "error");
}

// With contextual prefix
catch (error: unknown) {
  showSnackbar("Failed to register: " + extractErrorMessage(error), "error");
}

// Re-throw for context consumers (e.g., AuthProvider.login)
catch (error: unknown) {
  throw new Error(extractErrorMessage(error));
}
```

**Signature**:
```typescript
function extractErrorMessage(error: unknown, fallback?: string): string
```

**Resolution order**:
1. If `response.data.errors` is a non-empty array → joins all `.msg` fields with ", "
2. If `response.data.message` exists → returns it
3. If `error.message` exists (Axios network error) → returns it
4. Otherwise → returns the `fallback` (default: `"An unexpected error occurred"`)

### When NOT to Use It

- **Silent data fetches** (e.g., fetching movies on page load): Use `console.error` only. The user sees an empty state, not an error snackbar.
- **Status-code-specific logic** (e.g., 409 = "already verified"): Check the status first via `(error as AxiosError).response?.status`, then use `extractErrorMessage` for the error branch.

Example with status check:
```typescript
catch (error: unknown) {
  const axiosError = error as AxiosError;
  if (axiosError.response?.status === 409) {
    setMessage('Already verified!');
  } else {
    setMessage(extractErrorMessage(error, 'Verification failed'));
  }
}
```

---

## What Changed (Migration Summary)

### Problem

The server sent `{ message, status }` but many client files checked for `{ error: { message } }` (nested). This meant users saw generic Axios network errors (e.g., "Request failed with status code 401") instead of the actual server message (e.g., "Invalid password").

There were 6+ different catch block patterns across 29 files, with inconsistent typing, fallback chains, and error display.

### Solution

| Change | Files |
|---|---|
| Fixed rate limiter to use `{ message, status }` instead of `{ error: "..." }` | `server/middleware/rateLimiters.ts` |
| Created `extractErrorMessage` utility | `client/src/utils/extractErrorMessage.ts` |
| Replaced verbose catch blocks with utility calls | 18 client files |
| Removed unused `AxiosError` imports | 4 files (Register, Logout, ResetPasswordForm, ResetPasswordReq) |

**Net result**: -84 lines, +42 lines (including the new utility file).

### Files Updated

**Auth**: AuthProvider, Register, Logout, VerifyEmail, ResetPasswordForm, ResetPasswordReq
**Public**: ContactUs, MovieReview
**Admin Movies**: AdminMovies, AdminAddMovie, AdminEditMovie
**Admin Screenings**: AdminScreenings, AdminAddScreening, AdminEditScreening
**Admin Cinemas**: AdminAddCinema, AdminEditCinema
**Admin Users**: AdminAddUser
**Components**: PaymentDialog

---

## Guidelines for New Code

1. **Always use `extractErrorMessage`** for API error handling in catch blocks
2. **Always type catch as `error: unknown`** — not untyped `error` or `err`
3. **Prefix with context** — `"Failed to add movie: " + extractErrorMessage(error)` — so the user knows what operation failed
4. **Use the `fallback` parameter** when you want a specific default instead of the generic message
5. **Don't import `AxiosError`** unless you need to check `.response?.status` for branching logic
6. **Don't add new error response shapes on the server** — use the existing `AppError` subclasses from `server/utils/errors.ts`
