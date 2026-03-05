# Type Safety Improvements - Route Handlers

**Date**: 2026-03-05
**Status**: ✅ Completed

## Summary

Eliminated all type assertions in route handlers by creating helper functions and enforcing explicit type annotations across all route files.

## Problem

Route handlers had scattered type assertions and inconsistent patterns:

```typescript
// Before - Mixed patterns
async (req, res) => {  // Implicit any types
  const id = parseInt(req.params.id as string, 10);  // Type assertion
  if (isNaN(id)) throw new NotFoundError("Not found");
  const cinema_id = req.query.cinema_id as string;  // Type assertion
  // ...
}
```

**Issues:**
- 18+ instances of `as string` and `as any` type assertions
- Repetitive validation logic across routes
- Inconsistent error messages
- Mixed use of explicit vs implicit types

## Solution

### 1. Created Helper Functions

**File**: `server/utils/routeHelpers.ts`

```typescript
import { Request } from 'express';
import { NotFoundError, BadRequestError } from './errors.js';

/**
 * Parse and validate ID from route params
 * @throws NotFoundError if ID is invalid
 */
export function parseIdParam(req: Request, resourceName: string = 'Resource'): number {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    throw new NotFoundError(`${resourceName} not found`);
  }

  return parsedId;
}

/**
 * Parse optional cinema_id from query params
 * Returns null if invalid or missing
 */
export function parseCinemaIdQuery(req: Request): number | null {
  if (!req.query.cinema_id) return null;

  const cinemaId = Array.isArray(req.query.cinema_id)
    ? req.query.cinema_id[0]
    : req.query.cinema_id;

  if (typeof cinemaId !== 'string') return null;

  const parsedId = parseInt(cinemaId, 10);
  return isNaN(parsedId) ? null : parsedId;
}
```

### 2. Updated All Route Handlers

**Pattern Enforced:**
```typescript
async (req: Request, res: Response) => {
  const id = parseIdParam(req, "Resource");
  const cinema_id = parseCinemaIdQuery(req);
  // ... rest of handler
}
```

**Files Updated:**

| File | Handlers Updated | Changes |
|------|------------------|---------|
| `routes/users.ts` | 3 | Added explicit types, used parseIdParam |
| `routes/cinemas.ts` | 7 | Added explicit types, used parseIdParam |
| `routes/screenings.ts` | 7 | Added explicit types, used parseIdParam |
| `routes/movies.ts` | 11 | Added explicit types, used parseIdParam + parseCinemaIdQuery |
| `routes/auth.ts` | 4 | Already had explicit types ✓ |
| `routes/tickets.ts` | 2 | Already had explicit types ✓ |
| `routes/checkout.ts` | 1 | Already had explicit types ✓ |

**Total**: 35 route handlers reviewed, 28 updated

## Benefits

### Type Safety
- ✅ Zero type assertions (`as string`, `as any`)
- ✅ Full type inference throughout handlers
- ✅ Type-safe parameter parsing

### Code Quality
- ✅ Centralized validation logic
- ✅ Consistent error handling
- ✅ DRY principle applied (11 lines → 1-2 lines per route)

### Maintainability
- ✅ Single source of truth for param parsing
- ✅ Easy to extend with new helper functions
- ✅ Consistent error messages across all routes

## Examples

### Before & After: Simple ID Route

**Before:**
```typescript
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new NotFoundError("User not found");
    const user = await getUser(id);
    if (!user) throw new NotFoundError("User not found");
    respondWithJson(res, user);
});
```

**After:**
```typescript
router.get("/:id", async (req: Request, res: Response) => {
    const id = parseIdParam(req, "User");
    const user = await getUser(id);
    if (!user) throw new NotFoundError("User not found");
    respondWithJson(res, user);
});
```

### Before & After: Complex Route with Query Params

**Before:**
```typescript
router.get("/:id/screenings", async (req, res) => {
    const movie_id = parseInt(req.params.id as string, 10);
    if (isNaN(movie_id)) throw new NotFoundError("No movie with this id was found");

    let cinema_id: number | null = null;
    if (req.query.cinema_id) {
        const cinemaIdParam = Array.isArray(req.query.cinema_id)
            ? req.query.cinema_id[0]
            : req.query.cinema_id;
        if (typeof cinemaIdParam === 'string') {
            const parsedCinemaId = parseInt(cinemaIdParam, 10);
            if (!isNaN(parsedCinemaId)) {
                cinema_id = parsedCinemaId;
            }
        }
    }

    const screenings = await getUpcomingScreenings(cinema_id, movie_id);
    respondWithJson(res, screenings);
});
```

**After:**
```typescript
router.get("/:id/screenings", async (req: Request, res: Response) => {
    const movie_id = parseIdParam(req, "Movie");
    const cinema_id = parseCinemaIdQuery(req);

    const screenings = await getUpcomingScreenings(cinema_id, movie_id);
    respondWithJson(res, screenings);
});
```

**Reduction**: 11 lines → 2 lines (81% reduction)

## Testing

All existing tests continue to pass without modification:

```bash
npm run typecheck  # ✓ No TypeScript errors
npm test           # ✓ All 329 tests passing (9 skipped)
```

## Future Improvements

1. **Add More Helpers**: Create helpers for other common patterns (e.g., pagination params)
2. **Request Body Validation**: Consider similar helpers for request body parsing
3. **Type Definitions**: Create shared interface types for common request/response shapes
4. **Documentation**: Add JSDoc comments to all route handlers

## Related Documentation

- Helper functions: `server/utils/routeHelpers.ts`
- Error classes: `server/utils/errors.ts`
- Response helpers: `server/utils/responses.ts`
- Migration plan: `server/ts-migration-plan.md` (Phase 3)
- Memory: `.claude/memory/MEMORY.md`
- Project guide: `CLAUDE.md`
