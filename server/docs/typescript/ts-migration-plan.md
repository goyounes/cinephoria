# TypeScript Migration Plan - Cinephoria Server

## Executive Summary

**Goal**: Migrate the server folder from JavaScript to TypeScript while maintaining full functionality and test coverage.

**Strategy**: Incremental file-by-file migration allowing `.js` and `.ts` files to coexist.

**Timeline**: 13-15 days (part-time work)

**Approach**: Bottom-up dependency order (Config → Utils → Middleware → Controllers → Routes → App → Tests)

---

## Table of Contents

1. [Phase 0: Setup TypeScript Infrastructure](#phase-0-setup-typescript-infrastructure)
2. [Phase 1: Migrate Infrastructure Layer](#phase-1-migrate-infrastructure-layer)
3. [Phase 2: Migrate Business Logic Layer](#phase-2-migrate-business-logic-layer)
4. [Phase 3: Migrate Routing Layer](#phase-3-migrate-routing-layer)
5. [Phase 4: Migrate Application Core](#phase-4-migrate-application-core)
6. [Phase 5: Migrate Tests](#phase-5-migrate-tests)
7. [Phase 6: Build & Production Setup](#phase-6-build--production-setup)
8. [Phase 7: Gradual Strictness](#phase-7-gradual-strictness)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Verification Checklist](#verification-checklist)

---

## Phase 0: Setup TypeScript Infrastructure

**Duration**: 1 day
**Goal**: Install dependencies and create foundational TypeScript configuration

### Step 1: Install TypeScript Dependencies

```bash
cd server
npm install --save-dev typescript tsx @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/cookie-parser @types/cors @types/multer @jest/globals @types/jest @types/supertest ts-node
```

**What each package does**:
- `typescript` - TypeScript compiler (tsc)
- `tsx` - Fast TypeScript execution for development (modern alternative to ts-node)
- `@types/*` - Type definition files for third-party libraries
- `ts-node` - TypeScript execution for Jest
- `@jest/globals` - Jest type definitions

### Step 2: Create tsconfig.json

Create `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,

    "allowJs": true,
    "checkJs": false,

    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./",
    "sourceMap": true,

    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts", "**/*.js"],
  "exclude": ["node_modules", "dist", "coverage", "__tests__", "**/*.test.js"],
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

**Key configuration decisions**:
- `"allowJs": true` - Critical for incremental migration
- `"strict": false` - Start permissive, tighten gradually
- `"moduleResolution": "bundler"` - Best for modern ES modules + Node.js
- `"target": "ES2022"` - Matches Node.js 22 capabilities

### Step 3: Create Type Declaration Files

#### 3.1 Database Types (`server/types/database.ts`)

```typescript
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
```

#### 3.2 Express Augmentation (`server/types/express.d.ts`)

```typescript
import { AccessTokenPayload } from './database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        role_id: number;
        role_name: string;
      };
    }
  }
}

export {};
```

### Step 4: Update package.json Scripts

Add to `server/package.json`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx --watch server.ts",
    "dev:js": "cross-env NODE_ENV=development nodemon server.js",
    "build": "tsc",
    "start": "NODE_ENV=production node dist/server.js",
    "start:ts": "NODE_ENV=production tsx server.ts",
    "typecheck": "tsc --noEmit",
    "test": "cross-env NODE_ENV=test node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:unit": "cross-env NODE_ENV=test node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js --testPathIgnorePatterns=/__tests__/",
    "test:integration": "cross-env NODE_ENV=test node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js __tests__/integration/",
    "test:watch": "cross-env NODE_ENV=test node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "cross-env NODE_ENV=test node --no-deprecation --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  }
}
```

### Step 5: Verify Setup

```bash
npm run typecheck
```

Should succeed (may show warnings, but no errors since we're allowing JS files).

---

## Phase 1: Migrate Infrastructure Layer

**Duration**: 2-3 days
**Goal**: Migrate foundational files (config, utils, middleware)
**Order**: Config → Utils → Middleware

### Step 1: Migrate Configuration Files

#### 1.1 config/env.js → config/env.ts

**Current code**:
```javascript
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
```

**Migrated code**:
```typescript
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
```

**Changes**: Minimal - just rename file extension.

#### 1.2 config/mysqlConnect.js → config/mysqlConnect.ts

**Migrated code**:
```typescript
import mysql, { Pool, PoolOptions } from "mysql2/promise";

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000;

const poolConfig: PoolOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  dateStrings: true
};

export const pool: Pool = mysql.createPool(poolConfig);

export async function testConnectionWithRetry(retries: number = 0): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL!");
    connection.release();
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      console.error(`Could not connect to MySQL after ${retries} attempts:`, error);
      process.exit(1);
    } else {
      console.log(`MySQL not ready yet, retry ${retries + 1}/${MAX_RETRIES} - retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return testConnectionWithRetry(retries + 1);
    }
  }
}
```

**Key changes**:
- Import `Pool`, `PoolOptions` types from `mysql2/promise`
- Type `poolConfig` as `PoolOptions`
- Type `pool` as `Pool`
- Type function parameter `retries: number = 0`
- Return type `Promise<void>`

#### 1.3 config/redisConnect.js → config/redisConnect.ts

**Migrated code**:
```typescript
import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});

redisClient.on('error', (err: Error) => console.log('Redis Client Error', err));

export async function testRedisConnection(): Promise<void> {
  try {
    await redisClient.connect();
    console.log('Connected to Redis!');
  } catch (error) {
    console.error('Could not connect to Redis:', error);
  }
}
```

**Key changes**:
- Import `RedisClientType` from `redis`
- Type `redisClient` as `RedisClientType`
- Type error callback parameter
- Return type `Promise<void>`

### Step 2: Migrate Utility Functions

Migrate in this order:

1. `utils/randomImageName.js` → `utils/randomImageName.ts`
2. `utils/CombineGenresIdNames.js` → `utils/CombineGenresIdNames.ts`
3. `utils/CombineQualitiesIdNames.js` → `utils/CombineQualitiesIdNames.ts`
4. `utils/jwtTokens.js` → `utils/jwtTokens.ts`
5. `utils/generateEmailVerificationLink.js` → `utils/generateEmailVerificationLink.ts`
6. `utils/generatePasswordResetLink.js` → `utils/generatePasswordResetLink.ts`
7. `utils/index.js` → `utils/index.ts`

#### Example: utils/jwtTokens.ts

**Migrated code**:
```typescript
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload, EmailVerificationPayload, PasswordResetPayload } from '../types/database.js';

export function signAccessToken(user_id: number, role_id: number, role_name: string): string {
  return jwt.sign(
    { user_id, role_id, role_name, type: "access_token" } as Omit<AccessTokenPayload, 'iat' | 'exp'>,
    process.env.ACCESS_JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(user_id: number, token_version: number): string {
  return jwt.sign(
    { user_id, token_version, type: "refresh_token" } as Omit<RefreshTokenPayload, 'iat' | 'exp'>,
    process.env.REFRESH_JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function signEmailVerificationToken(user_id: number): string {
  return jwt.sign(
    { user_id, type: "email_verification" } as Omit<EmailVerificationPayload, 'iat' | 'exp'>,
    process.env.EMAIL_VERIFICATION_SECRET!,
    { expiresIn: "1h" }
  );
}

export function signPasswordResetToken(user_id: number): string {
  return jwt.sign(
    { user_id, type: "password_reset" } as Omit<PasswordResetPayload, 'iat' | 'exp'>,
    process.env.PASSWORD_RESET_SECRET!,
    { expiresIn: "15m" }
  );
}
```

**Key changes**:
- Import payload types from `types/database.js` (use .js extension!)
- Type all parameters
- Return type is `string`
- Use `Omit<>` utility to exclude `iat` and `exp` (added by jwt.sign)
- Use `!` assertion for environment variables

#### Example: utils/CombineGenresIdNames.ts

**Migrated code**:
```typescript
import { MovieRow } from '../types/database.js';

interface MovieWithGenres extends MovieRow {
  genres?: Array<{ id: number; name: string }>;
}

export default function CombineGenresIdNames(movies: MovieRow[]): MovieWithGenres[] {
  return movies.map((movie) => {
    const genres_ids = movie.genres_ids?.split(';').map(Number) || [];
    const genres_names = movie.genres_names?.split(';') || [];

    const genres = genres_ids.map((id, index) => ({
      id,
      name: genres_names[index]
    }));

    return { ...movie, genres };
  });
}
```

### Step 3: Migrate Middleware

Migrate in this order:

1. `middleware/cacheUtils.js` → `middleware/cacheUtils.ts`
2. `middleware/cacheMiddleware.js` → `middleware/cacheMiddleware.ts`
3. `middleware/rateLimiters.js` → `middleware/rateLimiters.ts`
4. `middleware/authMiddleware.js` → `middleware/authMiddleware.ts`

#### Example: middleware/authMiddleware.ts

**Migrated code**:
```typescript
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { AccessTokenPayload } from '../types/database.js';

type RoleCheckFunction = (role_id: number) => boolean;

function createRoleMiddleware(roleCheckFunc: RoleCheckFunction) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "No access token provided" });
        return;
      }
      const token = authHeader.split(' ')[1];

      let decoded: AccessTokenPayload;
      try {
        decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET!) as AccessTokenPayload;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(401).json({ message: "Access token expired" });
          return;
        }
        res.status(400).json({ message: "Invalid access token" });
        return;
      }

      if (!roleCheckFunc(decoded.role_id)) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      req.user = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        role_name: decoded.role_name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const verifyUserJWT = createRoleMiddleware((role_id) => role_id >= 1);
export const verifyEmployeeJWT = createRoleMiddleware((role_id) => role_id >= 2);
export const verifyAdminJWT = createRoleMiddleware((role_id) => role_id === 3);
```

**Key changes**:
- Import `Request`, `Response`, `NextFunction` from express
- Type `RoleCheckFunction` as function type
- Return type `Promise<void>` for async middleware
- Explicit `return` after `res.json()` calls
- Type `decoded` as `AccessTokenPayload`
- `instanceof` check for error types

### Verification After Phase 1

```bash
npm run typecheck  # Should pass
npm run dev:js     # Test with old JS entry point
npm test           # All tests should still pass
```

---

## Phase 2: Migrate Business Logic Layer

**Duration**: 3-4 days
**Goal**: Migrate controllers and API clients
**Order**: Simplest controllers first, most complex last

### Migration Order

1. `controllers/users.js` → `controllers/users.ts`
2. `controllers/cinemas.js` → `controllers/cinemas.ts`
3. `controllers/tickets.js` → `controllers/tickets.ts`
4. `controllers/screenings.js` → `controllers/screenings.ts`
5. `controllers/movies.js` → `controllers/movies.ts`
6. `controllers/auth.js` → `controllers/auth.ts`
7. `api/awsS3Client.js` → `api/awsS3Client.ts`
8. `api/emailClient.js` → `api/emailClient.ts`

### Critical MySQL Query Typing Pattern

```typescript
import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from "../config/mysqlConnect.js";
import { MovieRow, MySQLResultSetHeader } from '../types/database.js';

// For INSERT/UPDATE/DELETE (returns metadata)
const [result] = await connection.query<ResultSetHeader>(query, values);
console.log(result.insertId, result.affectedRows);

// For SELECT (returns rows)
const [rows] = await pool.query<MovieRow[] & RowDataPacket[]>(query, values);
return rows;

// For transactions
const connection: PoolConnection = await pool.getConnection();
```

### Example: controllers/movies.ts (partial)

```typescript
import { Request, Response, NextFunction } from 'express';
import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from "../config/mysqlConnect.js";
import { MovieRow, GenreRow, CreateMovieRequest } from '../types/database.js';

export async function addMovie(movie: CreateMovieRequest): Promise<ResultSetHeader | null> {
  const connection: PoolConnection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const q = `
      INSERT INTO movies (title, poster_img_name, description, age_rating, is_team_pick, length)
      VALUES (?,?,?,?,?,?);
    `;
    const VALUES = [
      movie.title,
      movie.poster_img_name,
      movie.description,
      movie.age_rating,
      movie.is_team_pick,
      movie.length,
    ];

    const [insertResult] = await connection.query<ResultSetHeader>(q, VALUES);

    if (!insertResult.insertId) {
      await connection.rollback();
      connection.release();
      return null;
    }

    const insertedMovieId = insertResult.insertId;

    if (movie.genres && movie.genres.length > 0) {
      const q2 = `INSERT INTO movie_genres (movie_id, genre_id) VALUES ?;`;
      const VALUES2 = movie.genres.map((genre) => [insertedMovieId, genre]);
      const [insertResult2] = await connection.query<ResultSetHeader>(q2, [VALUES2]);

      if (!insertResult2.affectedRows || insertResult2.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return null;
      }
    }

    await connection.commit();
    return insertResult;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getMoviesWithGenres(): Promise<MovieRow[]> {
  const q = `
    SELECT
      movies.*,
      GROUP_CONCAT(genres.genre_name SEPARATOR ';') as genres_names,
      GROUP_CONCAT(genres.genre_id SEPARATOR ';') AS genres_ids
    FROM movies
    LEFT JOIN movie_genres ON movies.movie_id = movie_genres.movie_id
    LEFT JOIN genres ON movie_genres.genre_id = genres.genre_id
    WHERE movies.isDeleted = FALSE
    GROUP BY movies.movie_id;
  `;
  const [result_rows] = await pool.query<MovieRow[] & RowDataPacket[]>(q);
  return result_rows;
}

export async function getGenres(): Promise<GenreRow[]> {
  const q = `SELECT * FROM genres;`;
  const [result_rows] = await pool.query<GenreRow[] & RowDataPacket[]>(q);
  return result_rows;
}

export async function deleteMovie(id: number): Promise<boolean> {
  const q = `UPDATE movies SET isDeleted = TRUE WHERE movie_id = ?;`;
  const [result] = await pool.query<ResultSetHeader>(q, [id]);
  return result.affectedRows > 0;
}
```

### Verification After Phase 2

After each controller migration:
```bash
npm run typecheck
npm run test:unit  # Unit tests should still pass
```

---

## Phase 3: Migrate Routing Layer

**Duration**: 2-3 days
**Goal**: Migrate all route files
**Order**: Match controller migration order

### ✅ COMPLETED: Type Safety Improvements (2026-03-05)

**What was done**: Eliminated all type assertions in route handlers by creating helper functions and adding explicit type annotations.

**Created**: `server/utils/routeHelpers.ts`
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

**Updated Route Files**:
- ✅ `routes/users.ts` - 3 handlers updated
- ✅ `routes/cinemas.ts` - 7 handlers updated
- ✅ `routes/screenings.ts` - 7 handlers updated
- ✅ `routes/movies.ts` - 11 handlers updated
- ✅ `routes/auth.ts` - Already had explicit types
- ✅ `routes/tickets.ts` - Already had explicit types
- ✅ `routes/checkout.ts` - Already had explicit types

**Pattern Changes**:

Before (with type assertions):
```typescript
async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) throw new NotFoundError("Not found");
  // ...
}
```

After (clean with helpers):
```typescript
async (req: Request, res: Response) => {
  const id = parseIdParam(req, "Movie");
  const cinema_id = parseCinemaIdQuery(req);
  // ...
}
```

**Benefits**:
- ✅ Zero type assertions (`as string`, `as any`)
- ✅ Consistent error handling
- ✅ Full type safety
- ✅ Centralized validation logic
- ✅ All route handlers use explicit `Request` and `Response` types

**Testing**: All 329 tests passing ✓

---

### Migration Order

1. `routes/users.js` → `routes/users.ts`
2. `routes/cinemas.js` → `routes/cinemas.ts`
3. `routes/tickets.js` → `routes/tickets.ts`
4. `routes/screenings.js` → `routes/screenings.ts`
5. `routes/movies.js` → `routes/movies.ts`
6. `routes/checkout.js` → `routes/checkout.ts`
7. `routes/auth.js` → `routes/auth.ts`

### Example: routes/movies.ts (partial)

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { verifyEmployeeJWT } from '../middleware/authMiddleware.js';
import { tryCache, saveToCache, invalidateCache } from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';
import {
  addMovie,
  getGenres,
  deleteMovie,
  updateMovie,
  getOneMovieWithGenres,
  getMoviesWithGenres,
} from '../controllers/movies.js';
import { s3, bucketName } from "../api/awsS3Client.js";
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from 'sharp';
import { randomImageName, CombineGenresIdNames } from '../utils/index.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/",
  tryCache('cache:movies:with_genres', CACHE_TTL.MOVIES),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawMovies = await getMoviesWithGenres();
      const movies = CombineGenresIdNames(rawMovies);

      for (const movie of movies) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: movie.poster_img_name
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        (movie as any).imageUrl = url;
      }

      await saveToCache('cache:movies:with_genres', movies, CACHE_TTL.MOVIES)(req, res, () => {});
      res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/",
  verifyEmployeeJWT,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No image file uploaded" });
        return;
      }

      const imageName = randomImageName();
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: 'contain' })
        .toBuffer();

      const uploadParams = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const movieData = {
        ...req.body,
        poster_img_name: imageName,
        genres: req.body.genres ? JSON.parse(req.body.genres) : []
      };

      const result = await addMovie(movieData);

      if (!result) {
        res.status(500).json({ message: "Failed to add movie" });
        return;
      }

      await invalidateCache('cache:movies:with_genres')(req, res, () => {});
      res.status(201).json({ movie_id: result.insertId });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### Verification After Phase 3

```bash
npm run typecheck
npm run test:integration  # Integration tests should pass
```

---

## Phase 4: Migrate Application Core

**Duration**: 1 day
**Goal**: Migrate main app files

### Files to Migrate

1. `app.js` → `app.ts`
2. `server.js` → `server.ts`

### Example: app.ts

```typescript
import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import usersRoutes from './routes/users.js';
import moviesRoutes from './routes/movies.js';
import screeningsRoutes from './routes/screenings.js';
import ticketsRoutes from './routes/tickets.js';
import checkoutRoutes from './routes/checkout.js';
import authRoutes from './routes/auth.js';
import cinemasRoutes from './routes/cinemas.js';
import { sendContactAcknowledgment, sendContactMessage } from './api/emailClient.js';

interface RateLimiters {
  authLimiter: RequestHandler;
  browsingLimiter: RequestHandler;
  bookingLimiter: RequestHandler;
}

export default function createApp(rateLimiters: RateLimiters): Express {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  const allowedOrigins = [
    process?.env.FRONTEND_URL || 'http://localhost:3000',
    'https://localhost',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
  ];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  const { authLimiter, browsingLimiter, bookingLimiter } = rateLimiters;

  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/users', browsingLimiter, usersRoutes);
  app.use('/api/v1/movies', browsingLimiter, moviesRoutes);
  app.use('/api/v1/screenings', browsingLimiter, screeningsRoutes);
  app.use('/api/v1/checkout', bookingLimiter, checkoutRoutes);
  app.use('/api/v1/tickets', browsingLimiter, ticketsRoutes);
  app.use('/api/v1/cinemas', browsingLimiter, cinemasRoutes);

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello from the backend!');
  });

  app.post("/api/v1/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sendContactMessage({
        name: req.body.message_sender_name,
        email: req.body.message_sender_email,
        subject: req.body.message_subject,
        message: req.body.message_text,
      });
      await sendContactAcknowledgment({
        name: req.body.message_sender_name,
        email: req.body.message_sender_email,
        subject: req.body.message_subject,
        message: req.body.message_text,
      });
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
    console.log("Server: Middleware logging error stack ...");
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || "Something broke in the web server!",
      status: err.status || 500
    });
  });

  return app;
}
```

### Example: server.ts

```typescript
import './config/env.js';
import createApp from "./app.js";
import { testConnectionWithRetry } from './config/mysqlConnect.js';
import { testRedisConnection } from './config/redisConnect.js';
import { authLimiter, browsingLimiter, bookingLimiter } from './middleware/rateLimiters.js';

const PORT: number = parseInt(process.env.PORT || '8080', 10);

async function startServer(): Promise<void> {
  try {
    await testConnectionWithRetry();
    await testRedisConnection();

    const app = createApp({ authLimiter, browsingLimiter, bookingLimiter });

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### Verification After Phase 4

```bash
npm run dev  # Should start with tsx
npm run typecheck  # Should pass
npm test  # All tests should pass
```

---

## Phase 5: Migrate Tests

**Duration**: 2-3 days
**Goal**: Migrate all test files to TypeScript

### Step 1: Configure Jest for TypeScript

Update `jest.config.js` → `jest.config.ts`:

```typescript
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
        },
      },
    ],
  },
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'controllers/**/*.ts',
    'utils/**/*.ts',
    'routes/**/*.ts',
  ],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/utils/testSetup.ts'],
};

export default config;
```

### Step 2: Migrate Test Utilities

1. `__tests__/utils/testSetup.js` → `__tests__/utils/testSetup.ts`
2. `__tests__/utils/dbTestUtils.js` → `__tests__/utils/dbTestUtils.ts`
3. `__tests__/utils/jwtTestUtils.js` → `__tests__/utils/jwtTestUtils.ts`

### Step 3: Migrate Unit Tests

1. `utils/randomImageName.test.js` → `utils/randomImageName.test.ts`
2. `utils/CombineGenresIdNames.test.js` → `utils/CombineGenresIdNames.test.ts`
3. `utils/CombineQualitiesIdNames.test.js` → `utils/CombineQualitiesIdNames.test.ts`

### Step 4: Migrate Integration Tests

Migrate all files in `__tests__/integration/*.test.js` → `*.test.ts`

### Example Test Pattern

```typescript
import { jest } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { RequestHandler } from 'express';

jest.mock('../../api/emailClient.js');

const { default: createApp } = await import('../../app.js');

const noRateLimit: RequestHandler = (req, res, next) => next();

const app: Express = createApp({
  authLimiter: noRateLimit,
  browsingLimiter: noRateLimit,
  bookingLimiter: noRateLimit
});

describe('Auth Integration Tests', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
  });
});
```

### Verification After Phase 5

```bash
npm test  # All 200+ tests should pass
npm run test:coverage  # Check coverage
```

---

## Phase 6: Build & Production Setup

**Duration**: 1 day
**Goal**: Setup production build and Docker

### Step 1: Verify Build

```bash
npm run build
```

Should create `dist/` folder with compiled JavaScript.

### Step 2: Test Production

```bash
npm start
```

Server should start from compiled `dist/server.js`.

### Step 3: Update Dockerfile

**Production Dockerfile** (`server/Dockerfile`):

```dockerfile
FROM node:22-slim AS builder

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-slim

WORKDIR /app
COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
```

### Step 4: Update .dockerignore

```
node_modules
npm-debug.log
dist
coverage
*.ts
!dist/**/*.js
tsconfig.json
__tests__
.git
.gitignore
*.md
.env
```

### Step 5: Update Docker Compose Dev

Update `Docker-compose.dev.yaml`:

```yaml
server:
  command: npx tsx --watch server.ts
  volumes:
    - ./server:/app
    - node_modules_server_dev:/app/node_modules
```

---

## Phase 7: Gradual Strictness

**Duration**: Ongoing (2-3 weeks)
**Goal**: Gradually increase type strictness

### Week 1: Enable noImplicitAny

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

Fix all `any` types.

### Week 2: Enable strictNullChecks

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Fix null/undefined handling.

### Week 3+: Full Strict Mode

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Fix all remaining type errors.

---

## Common Pitfalls & Solutions

### Pitfall 1: Import Extensions

**Problem**: TypeScript requires `.js` extensions even for `.ts` files.

**Solution**:
```typescript
import { pool } from '../config/mysqlConnect.js'; // Correct
import { pool } from '../config/mysqlConnect';    // Wrong
```

### Pitfall 2: MySQL Query Types

**Problem**: Generic type inference fails.

**Solution**:
```typescript
// Correct
const [rows] = await pool.query<MovieRow[] & RowDataPacket[]>(query);

// Fallback
const [rows] = await pool.query(query);
const typedRows = rows as MovieRow[];
```

### Pitfall 3: Middleware Return Types

**Problem**: Middleware must return `void` or `Promise<void>`.

**Solution**:
```typescript
async function handler(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.status(401).json({ message: "Error" });
  return; // Explicit return
}
```

### Pitfall 4: Environment Variables

**Problem**: `process.env.VAR` is `string | undefined`.

**Solution**:
```typescript
// Use non-null assertion if you're sure it exists
const secret = process.env.JWT_SECRET!;

// Or provide default
const port = process.env.PORT || '8080';
```

---

## Verification Checklist

After each phase:
- [ ] Server starts with `npm run dev`
- [ ] No TypeScript compilation errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Docker build succeeds
- [ ] Production build works (`npm run build && npm start`)

Final verification:
- [ ] All source files migrated to TypeScript
- [ ] All 200+ tests passing
- [ ] Development server works with `tsx`
- [ ] Production build compiles successfully
- [ ] Docker containers build and run
- [ ] Type safety for database queries
- [ ] IDE autocomplete working
- [ ] No `any` types (after strict mode)

---

## Success Criteria

✅ All `.js` files converted to `.ts`
✅ All tests passing
✅ Development workflow with `tsx`
✅ Production build compiles
✅ Docker deployment works
✅ Full type safety
✅ No compilation errors
✅ Improved IDE experience

---

## Rollback Strategy

If issues arise during migration:

1. **Per-file rollback**: Rename `.ts` back to `.js`
2. **Import fixes**: Update imports in dependent files
3. **Test verification**: Run tests after each rollback
4. **Git**: Use git to revert specific commits

---

## Next Steps After Migration

1. **Enable strict mode** gradually (Phase 7)
2. **Add ESLint** with TypeScript support
3. **Consider Prisma** or TypeORM for better database typing
4. **Update CLAUDE.md** with TypeScript patterns
5. **Save knowledge** to memory for future reference
