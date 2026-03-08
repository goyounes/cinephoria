# Client-Side TypeScript Migration - Complete Documentation

## Overview

Migrated the entire Cinephoria React client from JavaScript to TypeScript with full strict mode enabled. The migration was done incrementally across 8 phases, following the dependency graph from leaf modules up to entry points.

### Stats
- **72 files** migrated (67 renames + 5 new files)
- **0 type errors** with `strict: true`
- **2 latent bugs fixed** that TypeScript caught
- **25+ shared interfaces** defined in a central type system
- **8 git commits** - one per phase for clean history

### Commits
```
5a2937b Phase 1 - TypeScript foundation - tsconfig, shared types, dependencies
17207fd Phase 2 - migrate utilities, hooks, and API layer to TypeScript
41aaebd Phase 3 - migrate context providers to TypeScript
5bd9168 Phase 4 - migrate shared components to TypeScript
5106490 Phase 5 - migrate auth pages to TypeScript
a69b7d9 Phase 6 - migrate core public pages to TypeScript
bc7f408 Phase 7 - migrate admin dashboard pages to TypeScript
a42db6d Phase 8 - migrate entry points, final strict mode lockdown
```

---

## Phase-by-Phase Breakdown

### Phase 1 - Foundation (5 new files)

Set up the TypeScript infrastructure without touching any existing code.

**What was done:**
- Installed `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- Created `client/tsconfig.json` with strict mode configuration
- Created `client/src/types/models.ts` - central type definitions for all API response shapes
- Created `client/src/types/index.ts` - barrel export
- Created `client/src/types/assets.d.ts` - module declarations for image imports (`.png`, `.webp`, `.jpg`, `.svg`)

**tsconfig.json configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Key choices:
- `allowJs: true` temporarily enabled so existing .js files don't break during incremental migration
- `noEmit: true` because CRA handles compilation (we only use `tsc` for type-checking)
- `jsx: "react-jsx"` for React 17+ automatic JSX transform
- `moduleResolution: "node"` to match CRA's webpack resolver
- `noUnusedParameters: false` because React event handlers often have unused params (e.g., `_event`)

**Shared type system (`models.ts`):**

Defined 25+ interfaces by reading every component to determine the actual API response shapes:

| Interface | Purpose |
|-----------|---------|
| `Movie`, `Genre` | Movie data with genres array |
| `Cinema`, `Room` | Cinema and room structures |
| `Screening`, `Quality` | Screening times with quality options |
| `TicketType`, `Ticket` | Ticket booking types |
| `Review` | Movie reviews |
| `User`, `Role`, `CurrentUser` | User management |
| `LoginInputs`, `LoginResponse` | Auth flow types |
| `Order`, `OrderTicketType`, `CardInfo` | Checkout flow |
| `CardExpiryValidation` | Card validation result |
| `SnackbarSeverity` | Union type for snackbar variants |
| `RoomGroup`, `CinemaGroup` | Grouped screening structures |
| `GroupedScreeningsByDate` | Nested date > cinema > room > screenings |
| `GroupedScreeningsByMovie` | Movie ID to screenings mapping |
| `MovieFilterOptions` | Filter state for movie listings |
| `SortConfig` | Admin table sort state |

---

### Phase 2 - Utilities, Hooks, API Layer (13 files)

Renamed all `.js` utility files to `.ts` and added type annotations. These are leaf dependencies with no JSX.

**Files migrated:**
| File | Key typing |
|------|-----------|
| `api/axiosInstance.ts` | Typed `getBaseURL(): string`, typed axios instance |
| `hooks/useRouteTitle.ts` | `(title: string): void` |
| `utils/formatDateToMySQL.ts` | `(date: Date): string` |
| `utils/filterMoviesForSelectedDate.ts` | `(formattedDate: string, movies: Movie[]): Movie[]` |
| `utils/groupScreeningsByMovie.ts` | `(screenings: Screening[]): GroupedScreeningsByMovie` |
| `utils/groupScreenings.ts` | `(screenings: Screening[]): GroupedScreeningsByDate` |
| `utils/hasAnyGenre.ts` | `(movie: Movie, selectedGenres: Genre[]): boolean` |
| `utils/validateCardExpiryDate.ts` | `(value: string): CardExpiryValidation` |
| `utils/getAllowedScreeningDates.ts` | `(movies: Movie[]): string[]` |
| `utils/filterAndUniqueMovies.ts` | `(movies: Movie[], options: MovieFilterOptions): Movie[]` |
| `utils/uniqueMovies.ts` | `(movies: Movie[]): Movie[]` |
| `utils/filterMovies.ts` | `(movies: Movie[], options: MovieFilterOptions): Movie[]` |
| `utils/index.ts` | Updated barrel imports (removed `.js` extensions) |

---

### Phase 3 - Context Providers (2 files)

The two global context providers consumed by nearly every component.

**AuthProvider.tsx:**
- Defined `AuthContextType` interface with `currentUser`, `login`, `logout`, `resetPasswordReq`
- Extended `InternalAxiosRequestConfig` with `_retry` property for token refresh interceptor
- Used `createContext<AuthContextType | null>(null)` with guard in `useAuth()` hook
- Wrapped `login`, `logout`, `resetPasswordReq` in `useCallback` for reference stability
- Typed axios interceptors with proper request/response/error types

**SnackbarProvider.tsx:**
- Defined `SnackbarItem`, `SnackbarContextType`, `CustomSnackbarProps` interfaces
- Wrapped `showSnackbar` in `useCallback` to prevent unnecessary re-renders in consumers
- Typed MUI `onClose` handler: `(_: React.SyntheticEvent | Event, reason?: string)`

---

### Phase 4 - Shared Components (17 files)

All reusable components that are imported by pages.

**Layout components (3):**
- `RealNavBar.tsx` - reads from auth context, no props needed
- `AdminSideBar.tsx` - reads from context/location, no props
- `Footer.tsx` - defined `CinemaInfo` interface for static data

**UI components (7):**
- `TitleWrapper.tsx` - `{ title: string; children: React.ReactNode }`
- `BasicModal.tsx` - `{ open: boolean; onClose: () => void; children: React.ReactNode }`
- `BasicDatePicker.tsx` - dayjs value with onChange callback
- `ImageUploader.tsx` - `{ onFileSelect: (file: File) => void }`
- `ImageWithSkeleton.tsx` - image props with sx spread
- `ResponsiveIconButton.tsx` - icon + children + MUI ButtonProps
- `ModalWrapper.tsx` - modal wrapper with props interface

**Page sub-components (7):**
- `MovieCard.tsx`, `MovieDetails.tsx`, `MovieScreenings.tsx` - movie display components
- `ScreeningsTable.tsx`, `ScreeningButton.tsx` - screening display
- `PaymentDialog.tsx` - checkout dialog with card info props
- `TicketCard.tsx` - ticket display component

---

### Phase 5 - Auth Pages (7 files)

All authentication-related pages.

| File | Key typing work |
|------|----------------|
| `Login.tsx` | `LoginInputs` state, `React.FormEvent` handler, `AxiosError` catch |
| `Register.tsx` | Registration form state, validation errors as `Record<string, string>` |
| `Logout.tsx` | Simple effect calling `logout()`, typed navigate |
| `Account.tsx` | `Ticket[]` state, `CurrentUser` from context |
| `VerifyEmail.tsx` | Token from `useParams()`, status state |
| `ResetPasswordReq.tsx` | Email form state |
| `ResetPasswordForm.tsx` | Password + token state, form validation |

---

### Phase 6 - Core Public Pages (9 files)

All public-facing pages.

| File | Key typing work |
|------|----------------|
| `Home.tsx` | `Movie[]` state, API response typing |
| `Movies.tsx` | `Movie[]`, `Cinema[]`, `Genre[]` state, `SelectChangeEvent` for MUI selects |
| `Movie.tsx` | Single `Movie \| null` state, `Review[]` state |
| `Reservation.tsx` | Grouped screenings state, screening selection |
| `Checkout.tsx` | `Order`, `CardInfo`, `TicketType[]` state |
| `ContactUs.tsx` | `ContactFormData` interface, form handlers |
| `MovieReview.tsx` | Review form state, rating value |
| `NotAuthorized.tsx` | No state, simple display |
| `ProtectedRoutes.tsx` | `{ requiredRoleId: number }` props |

---

### Phase 7 - Admin Dashboard Pages (16 files)

The largest phase - all admin CRUD pages.

**Movies (3):** `AdminMovies.tsx`, `AdminAddMovie.tsx`, `AdminEditMovie.tsx`
- `SortConfig` for table sorting with dynamic key access
- `FormData` for image uploads with `Omit<Movie, 'length'> & { length: string }` override
- `Genre[]` autocomplete typing

**Screenings (3):** `AdminScreenings.tsx`, `AdminAddScreening.tsx`, `AdminEditScreening.tsx`
- Complex form state with movie/cinema/room selects
- Time picker typing with dayjs
- Screening with joined fields from multiple tables

**Cinemas (3):** `AdminCinemas.tsx`, `AdminAddCinema.tsx`, `AdminEditCinema.tsx`
- Cinema CRUD with room management
- Form state typing

**Users (2):** `AdminUsers.tsx`, `AdminAddUser.tsx`
- `User[]` state with role display
- Role select typing

**Tickets (1):** `AdminTickets.tsx`
- `Ticket[]` with joined fields

**Statistics (4):** `ScreeningStatistics.tsx`, `MovieScreeningsCalendar.tsx`, `ScreeningsStatsTable.tsx`, `ScreeningStatButton.tsx`
- Statistics dashboard with computed data
- Calendar view state
- Button component props

**Dashboard (1):** `AdminDashboard.tsx`
- `Message` interface for contact form messages

---

### Phase 8 - Entry Points + Final Cleanup (3 files)

**Files renamed:**
- `index.js` -> `index.tsx` - added `as HTMLElement` cast for `getElementById('root')`
- `App.js` -> `App.tsx` - fixed `currentUser?.role_id >= 2` to `(currentUser?.role_id ?? 0) >= 2`
- `App.test.js` -> `App.test.tsx` - added `import '@testing-library/jest-dom'`

**Final tsconfig tightening:**
- Removed `"allowJs": true` (no more JS files in the project)
- Removed `"checkJs": false`
- Installed `@types/jest` (with `--legacy-peer-deps` for CRA compatibility)

---

## Challenges & Solutions

### 1. Axios `_retry` property on interceptor config
**Problem**: The response interceptor adds `_retry` to the request config for token refresh logic, but `InternalAxiosRequestConfig` doesn't have this property.
**Solution**: Extended the type:
```typescript
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
```
Then cast in the interceptor: `const originalRequest = error.config as RetryableAxiosRequestConfig`

### 2. `createContext()` requires a default value in strict mode
**Problem**: `createContext()` with no argument fails under strict null checks.
**Solution**: Use `createContext<AuthContextType | null>(null)` and throw in the hook:
```typescript
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
```

### 3. Nullable `currentUser?.role_id >= 2` comparisons
**Problem**: `currentUser?.role_id >= 2` compares `undefined >= 2` which is always `false` but TS flags it.
**Solution**: `(currentUser?.role_id ?? 0) >= 2` - explicit fallback to 0.

### 4. `!arr.length > 0` logic bug (found by TS)
**Problem**: In `filterMovies.ts` and `filterAndUniqueMovies.ts`, `!movie.genres.length > 0` was intended as "if no genres". But `!` binds tighter than `>`, so it evaluates as `(!movie.genres.length) > 0` which is `boolean > number`.
**Solution**: Changed to `movie.genres.length === 0`. This was a **real bug** that TS caught - the original JS code silently produced wrong results.

### 5. `groupScreenings` deeply nested dynamic-key objects
**Problem**: The function builds `{ [date]: { [cinemaId]: { cinema_id, cinema_name, [roomId]: { room_id, room_name, screenings[] } } } }` - mixing metadata props with dynamic numeric keys on the same object.
**Solution**: Used `CinemaGroup` interface with index signature `[roomId: number]: RoomGroup` plus explicit metadata fields. Required `as RoomGroup` cast when accessing dynamic room keys.

### 6. MUI Snackbar `onClose` event type
**Problem**: MUI's `Snackbar.onClose` expects `(event: React.SyntheticEvent | Event, reason?: string)`.
**Solution**: Typed explicitly: `const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {}`

### 7. Import order lint errors (ESLint `import/first`)
**Problem**: During migration, interface declarations were accidentally inserted between import statements, causing ESLint `import/first` errors on build.
**Solution**: Moved all interfaces below the import block. Lesson: always keep all imports grouped at the top of the file before any other declarations.

### 8. `document.getElementById('root')` returns `HTMLElement | null`
**Problem**: `ReactDOM.createRoot()` requires `HTMLElement`, not `null`.
**Solution**: `document.getElementById('root') as HTMLElement` - safe because `index.html` always has a `#root` div.

### 9. npm peer dependency conflicts with TypeScript 5.x
**Problem**: `react-scripts@5.0.1` declares `peerOptional typescript@"^3.2.1 || ^4"` but we installed TS 5.x.
**Solution**: Used `--legacy-peer-deps` for `@types/jest`. CRA works fine with TS 5.x despite the peer dep warning. This is a known CRA limitation since the project is no longer actively maintained.

### 10. Date arithmetic in sort comparisons
**Problem**: `new Date(a) - new Date(b)` doesn't work in TS because the `-` operator isn't defined for `Date` objects.
**Solution**: `new Date(a).getTime() - new Date(b).getTime()` - convert to milliseconds first.

### 11. `SelectChangeEvent` typing for MUI selects
**Problem**: MUI Select `onChange` uses `SelectChangeEvent<T>`, not the standard React `ChangeEvent`.
**Solution**: Import `SelectChangeEvent` from `@mui/material` and use the correct generic: `SelectChangeEvent<number | ''>` for numeric filters, `SelectChangeEvent<string>` for text selects.

### 12. Dynamic key access in admin table sorting
**Problem**: Admin tables sort by dynamic keys like `sortConfig.key`, but TS doesn't allow indexing typed objects with arbitrary strings.
**Solution**: Cast to record type: `(a as unknown as Record<string, unknown>)[sortConfig.key!]`

### 13. Movie `length` field type mismatch
**Problem**: Server returns `length` as a time string (`"01:30:00"`) in edit endpoints but `models.ts` types it as `number`.
**Solution**: Used `Omit<Movie, 'length'> & { length: string }` for the API response in edit pages. This overrides just the `length` field's type while keeping everything else from `Movie`.

---

## Patterns Established

### Props interfaces
Every component gets an explicit props interface:
```typescript
interface MovieCardProps {
  movie: Movie;
  to?: string;
  onClick?: () => void;
}
const MovieCard = ({ movie, to, onClick }: MovieCardProps) => { ... };
```

### Typed state
Always provide the generic to `useState` when the initial value doesn't convey the full type:
```typescript
const [movies, setMovies] = useState<Movie[]>([]);
const [movie, setMovie] = useState<Movie | null>(null);
const [loading, setLoading] = useState<boolean>(true);
```

### Error handling
Use `unknown` in catch blocks, cast to `AxiosError` with typed response body:
```typescript
catch (error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;
  showSnackbar(axiosError.response?.data?.message || "Error", "error");
}
```

### Form data typing
Define an interface for each form's state shape:
```typescript
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
const [formData, setFormData] = useState<ContactFormData>({ ... });
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
```

### Typed event handlers
```typescript
// Standard HTML inputs
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... };

// MUI Select
const handleSelectChange = (e: SelectChangeEvent<number | ''>) => { ... };

// MUI Snackbar close
const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => { ... };
```

### Context with null guard
```typescript
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
```

### Axios response typing
```typescript
// The generic tells axios what shape res.data will have
const res = await axios.get<Movie[]>('/api/v1/movies');
// res.data is Movie[]

const res = await axios.post<LoginResponse>('/api/v1/auth/login', inputs);
// res.data is LoginResponse
```

### Type override with Omit
When one field has a different type than the shared interface:
```typescript
type EditMovieData = Omit<Movie, 'length'> & { length: string };
const res = await axios.get<EditMovieData>(`/api/v1/movies/${id}/edit`);
```

---

## File Structure After Migration

```
client/
  tsconfig.json                          # TypeScript config (strict mode)
  src/
    index.tsx                            # App entry point
    App.tsx                              # Route configuration
    App.test.tsx                         # Smoke test
    types/
      models.ts                          # 25+ shared interfaces
      index.ts                           # Barrel export
      assets.d.ts                        # Image/asset module declarations
    api/
      axiosInstance.ts                   # Configured axios instance
    hooks/
      useRouteTitle.ts                   # Document title hook
    context/
      AuthProvider.tsx                   # Auth context + JWT interceptors
      SnackbarProvider.tsx               # Snackbar notifications context
    utils/
      index.ts                           # Barrel export
      filterMovies.ts                    # Filter by cinema/genre
      filterAndUniqueMovies.ts           # Filter + deduplicate
      filterMoviesForSelectedDate.ts     # Filter by date
      uniqueMovies.ts                    # Deduplicate by movie_id
      hasAnyGenre.ts                     # Genre matching check
      groupScreenings.ts                 # Group by date > cinema > room
      groupScreeningsByMovie.ts          # Group by movie ID
      getAllowedScreeningDates.ts        # Extract unique dates
      formatDateToMySQL.ts              # Date formatting
      validateCardExpiryDate.ts          # Card validation
      extractErrorMessage.ts             # Unified error extraction
    components/
      Layout/
        RealNavBar.tsx                   # Main navigation
        TopNavBar.tsx                    # Admin top navigation
        AdminSideBar.tsx                 # Admin sidebar
        Footer.tsx                       # Site footer
      UI/
        BasicModal.tsx                   # Reusable modal
        BasicDatePicker.tsx              # Date picker wrapper
        ImageUploader.tsx                # Image upload component
        ImageWithSkeleton.tsx            # Image with loading skeleton
        ResponsiveIconButton.tsx         # Responsive button
        ModalWrapper.tsx                 # Modal wrapper
      TitleWrapper.tsx                   # Page title wrapper
    pages/
      Home.tsx                           # Homepage
      Movies.tsx                         # Movie listing with filters
      Movie.tsx                          # Single movie detail
      Reservation.tsx                    # Screening selection
      Checkout.tsx                       # Payment flow
      ContactUs.tsx                      # Contact form
      MovieReview.tsx                    # Write a review
      NotAuthorized.tsx                  # 403 page
      ProtectedRoutes.tsx                # Role-based route guard
      Auth/
        Login.tsx, Register.tsx, Logout.tsx
        Account.tsx, VerifyEmail.tsx
        ResetPasswordReq.tsx, ResetPasswordForm.tsx
      AdminDashboard/
        AdminDashboard.tsx               # Dashboard with messages
        Movies/    (3 files)             # Movie CRUD
        Screenings/ (3 files)            # Screening CRUD
        Cinemas/   (3 files)             # Cinema CRUD
        Users/     (2 files)             # User management
        Tickets/   (1 file)              # Ticket listing
        Statistics/ (4 files)            # Stats dashboard
      components/
        MovieCard.tsx, MovieDetails.tsx, MovieScreenings.tsx
        ScreeningsTable.tsx, ScreeningButton.tsx
        PaymentDialog.tsx, TicketCard.tsx
        SearchMovieModal.tsx
        RoomSingleSelect.tsx, RoomMultiSelect.tsx
  docs/
    typescript/
      client-ts-migration.md            # This document
```

---

## Migration Strategy Notes

### Why incremental?
CRA supports mixed JS/TS when `allowJs: true` is set. This let us migrate phase by phase, verifying `tsc --noEmit` passes after each phase, rather than converting everything at once and debugging hundreds of errors.

### Why strict from the start?
Starting with `strict: false` and tightening later means revisiting every file twice. By enabling `strict: true` from the beginning (with `allowJs` so unchecked JS files coexist), each file is typed correctly on its first pass.

### Dependency order matters
The phases follow the import graph bottom-up:
1. Types (no imports)
2. Utils/hooks (import types only)
3. Contexts (import utils + types)
4. Components (import contexts + types)
5. Pages (import everything above)
6. Entry points (import pages + contexts)

This ensures that when you type a file, all its imports are already typed.

### No `.js` extensions in imports
CRA's webpack resolver handles extension resolution. All imports use extensionless paths: `import axios from '../api/axiosInstance'` (unlike the server which requires `.js` extensions for Node.js ES modules).