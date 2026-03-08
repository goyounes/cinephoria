# Client TypeScript Migration - Technical Solutions & Challenges

## Migration Stats
- **72 files** migrated across 8 phases
- **0 type errors** with `strict: true`
- **2 latent bugs fixed** during migration

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
**Solution**: `(currentUser?.role_id ?? 0) >= 2` — explicit fallback to 0.

### 4. `!arr.length > 0` logic bug (found by TS)
**Problem**: In `filterMovies.ts` and `filterAndUniqueMovies.ts`, `!movie.genres.length > 0` was intended as "if no genres". But `!` binds tighter than `>`, so it evaluates as `(!movie.genres.length) > 0` which is `boolean > number`.
**Solution**: Changed to `movie.genres.length === 0`. This was a real bug that TS caught.

### 5. `groupScreenings` deeply nested dynamic-key objects
**Problem**: The function builds `{ [date]: { [cinemaId]: { cinema_id, cinema_name, [roomId]: { room_id, room_name, screenings[] } } } }` — mixing metadata props with dynamic numeric keys on the same object.
**Solution**: Used `CinemaGroup` interface with index signature `[roomId: number]: RoomGroup` plus explicit metadata fields. Required `as RoomGroup` cast when accessing dynamic room keys.

### 6. MUI Snackbar `onClose` event type
**Problem**: MUI's `Snackbar.onClose` expects `(event: React.SyntheticEvent | Event, reason?: string)`.
**Solution**: Typed explicitly: `const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {}`

### 7. Import order lint errors (ESLint `import/first`)
**Problem**: Subagent inserted interface declarations between import statements, causing ESLint `import/first` errors.
**Solution**: Moved all interfaces below the import block. Lesson: always keep imports grouped at the top.

### 8. `document.getElementById('root')` returns `HTMLElement | null`
**Problem**: `ReactDOM.createRoot()` requires `HTMLElement`, not `null`.
**Solution**: `document.getElementById('root') as HTMLElement` — safe because index.html always has `#root`.

### 9. npm peer dependency conflicts with TypeScript 5.x
**Problem**: `react-scripts@5.0.1` declares `peerOptional typescript@"^3.2.1 || ^4"` but we installed TS 5.x.
**Solution**: Used `--legacy-peer-deps` for `@types/jest`. CRA works fine with TS 5.x despite the peer dep warning.

### 10. Date arithmetic in sort comparisons
**Problem**: `new Date(a) - new Date(b)` doesn't work in TS because `-` operator isn't defined for `Date`.
**Solution**: `new Date(a).getTime() - new Date(b).getTime()`

### 11. `SelectChangeEvent` typing for MUI selects
**Problem**: MUI Select `onChange` uses `SelectChangeEvent<T>`, not standard React `ChangeEvent`.
**Solution**: Import `SelectChangeEvent` from `@mui/material` and use the correct generic: `SelectChangeEvent<number | ''>` for filters, `SelectChangeEvent<string>` for text selects.

### 12. Dynamic key access in admin table sorting
**Problem**: Admin tables sort by dynamic keys like `sortConfig.key`, but TS doesn't allow indexing typed objects with arbitrary strings.
**Solution**: Cast to record type: `(a as unknown as Record<string, unknown>)[sortConfig.key!]`

### 13. Movie `length` field type mismatch
**Problem**: Server returns `length` as a time string (`"01:30:00"`) in edit endpoints but `models.ts` types it as `number`.
**Solution**: Used `Omit<Movie, 'length'> & { length: string }` for the API response in edit pages.

---

## Key Patterns Established

### Props interfaces
```typescript
interface MovieCardProps {
  movie: Movie;
  to?: string;
  onClick?: () => void;
}
const MovieCard = ({ movie, to, onClick }: MovieCardProps) => { ... };
```

### Typed state
```typescript
const [movies, setMovies] = useState<Movie[]>([]);
const [movie, setMovie] = useState<Movie | null>(null);
const [loading, setLoading] = useState<boolean>(true);
```

### Error handling
```typescript
catch (error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;
  showSnackbar(axiosError.response?.data?.message || "Error", "error");
}
```

### Form data typing
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
