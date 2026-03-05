# TypeScript Migration - Codebase Exploration

## Overview

This document contains comprehensive exploration of the Cinephoria server codebase in preparation for TypeScript migration.

---

## Server Architecture Analysis

### Overall Structure

```
server/
├── server.js                 # Entry point (28 lines)
├── app.js                    # Express app factory (80 lines)
├── config/                   # Configuration & services (3 files)
├── controllers/              # Business logic (6 files)
├── routes/                   # API route handlers (7 files)
├── middleware/               # Custom middleware (4 files)
├── api/                      # External service integrations (2 files)
├── utils/                    # Helper functions & utilities (7 files)
├── __tests__/                # Test suites (200+ tests)
└── package.json              # ES modules enabled
```

### Key Characteristics

- **Module System**: ES Modules (`"type": "module"` in package.json)
- **Node Version**: Node.js 22 (uses `node:22-slim` in Docker)
- **Architecture**: Layered (Config → Controllers → Routes)
- **Pattern**: Factory functions with dependency injection
- **Database**: MySQL2 with connection pooling
- **Cache**: Redis for sessions and caching
- **Testing**: Jest with 200+ integration and unit tests

---

## Main Entry Points

### server.js (Entry Point)

**Purpose**: Simple startup file that initializes and starts the server

**Pattern**:
```javascript
import './config/env.js';  // Load environment first
import createApp from "./app.js";
import { authLimiter, browsingLimiter, bookingLimiter } from './middleware/rateLimiters.js';

// Test connections before starting
await testConnectionWithRetry();
await testRedisConnection();

// Create app with injected rate limiters
const app = createApp({ authLimiter, browsingLimiter, bookingLimiter });

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Migration Notes**:
- Top-level async code (supported in ES modules)
- Simple dependency injection pattern
- Will need typing for rate limiter objects

### app.js (Express Application Factory)

**Purpose**: Creates and configures the Express application

**Pattern**:
```javascript
export default function createApp(rateLimiters) {
  const app = express();
  const { authLimiter, browsingLimiter, bookingLimiter } = rateLimiters;

  // Middleware setup
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  // Route mounting
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/users', browsingLimiter, usersRoutes);
  // ... more routes

  // Error handling middleware
  app.use((err, req, res, next) => { /* ... */ });

  return app;
}
```

**Migration Notes**:
- Factory pattern is TypeScript-friendly
- Rate limiters need `RequestHandler` type
- CORS origins need type safety
- Error handler needs proper Error typing

---

## Folder Organization

### config/ (3 files)

**Files**:
- `env.js` - Environment variable loading with conditional .env processing
- `mysqlConnect.js` - MySQL pool with retry logic (10 retries, 5s intervals)
- `redisConnect.js` - Redis client with connection state management

**Pattern**: Configuration/connection management with export of initialized instances

**env.js**:
```javascript
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
```

**mysqlConnect.js**:
```javascript
import mysql from "mysql2";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  dateStrings: true
}).promise();

export async function testConnectionWithRetry(retries = 0) {
  // Retry logic with exponential backoff
}
```

**Migration Notes**:
- mysql2 has `Pool` and `PoolOptions` types
- Redis has built-in TypeScript support
- Environment variables need typed config object

### controllers/ (6 files)

**Files**:
- `auth.js` - Authentication and authorization services
- `users.js` - User management
- `movies.js` - Movie CRUD with S3 integration
- `screenings.js` - Screening management
- `tickets.js` - Ticket booking
- `cinemas.js` - Cinema and room management

**Pattern**:
- Export named async functions (services)
- Direct database queries using MySQL pool
- Transaction handling with proper rollback
- No classes - pure functional approach

**Example Structure** (movies.js):
```javascript
export async function addMovie(movie) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [insertResult] = await connection.query(q, VALUES);
    await connection.commit();
    return insertResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getMoviesWithGenres() {
  const [result_rows] = await pool.query(q);
  return result_rows;
}
```

**Migration Notes**:
- Functions need typed parameters and return types
- MySQL query results need generic type parameters
- `PoolConnection` type for transactions
- Database row types for SELECT queries
- `MySQLResultSetHeader` for INSERT/UPDATE/DELETE

### routes/ (7 files)

**Files**:
- `auth.js` - Authentication endpoints
- `users.js` - User management endpoints
- `movies.js` - Movie CRUD endpoints
- `screenings.js` - Screening management
- `tickets.js` - Ticket booking
- `cinemas.js` - Cinema management
- `checkout.js` - Payment processing

**Pattern**:
```javascript
import { Router } from 'express';
const router = Router();
import { registerService, loginService } from '../controllers/auth.js';

router.post('/register',
  [validationRules],
  (req, res, next) => registerService(req, res, next)
);

export default router;
```

**Migration Notes**:
- Router type from Express
- Middleware chains need proper typing
- Request/Response/NextFunction types
- Validation middleware from express-validator (has built-in types)

### middleware/ (4 files)

**Files**:
- `authMiddleware.js` - Role-based JWT verification (factory pattern)
- `cacheMiddleware.js` - Redis caching layer
- `cacheUtils.js` - Cache TTL constants
- `rateLimiters.js` - Custom Redis-based rate limiting

**Pattern** (authMiddleware.js):
```javascript
function createRoleMiddleware(roleCheckFunc) {
  return async function(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

      if (!roleCheckFunc(decoded.role_id)) {
        return res.status(403).json({ message: "Access denied" });
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
```

**Migration Notes**:
- Factory functions work well with TypeScript generics
- JWT payload needs typed interface
- Request augmentation for `req.user`
- Middleware must return `void` or `Promise<void>`

### api/ (2 files)

**Files**:
- `awsS3Client.js` - Initialized S3 client exports
- `emailClient.js` - SendGrid email functions

**Pattern**:
```javascript
import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCES_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCES_KEY,
  },
  region: process.env.S3_BUCKET_REGION
});

export const bucketName = process.env.S3_BUCKET_NAME;
```

**Migration Notes**:
- AWS SDK v3 has built-in TypeScript support
- SendGrid has type definitions
- Simple file, minimal changes needed

### utils/ (7 files)

**Files**:
- `randomImageName.js` - UUID generation for images
- `CombineGenresIdNames.js` - Data transformation utility
- `CombineQualitiesIdNames.js` - Data transformation utility
- `jwtTokens.js` - Token signing functions
- `generateEmailVerificationLink.js` - Email link generation
- `generatePasswordResetLink.js` - Password reset link generation
- `index.js` - Barrel export file

**Pattern**:
```javascript
// randomImageName.js
import crypto from 'crypto';

export default function randomImageName() {
  return crypto.randomBytes(32).toString('hex');
}

// jwtTokens.js
export function signAccessToken(user_id, role_id, role_name) {
  return jwt.sign(
    { user_id, role_id, role_name, type: "access_token" },
    process.env.ACCESS_JWT_SECRET,
    { expiresIn: '15m' }
  );
}
```

**Migration Notes**:
- Pure functions - easy to type
- Each has corresponding `.test.js` file
- JWT functions need payload type interfaces
- Barrel file needs proper re-exports

---

## Import/Export Patterns

### Consistent ES Modules Usage

**Import Pattern**:
```javascript
// Named imports with .js extension
import { pool } from "../config/mysqlConnect.js";
import { Router } from 'express';

// Default imports
import createApp from './app.js';
import randomImageName from './randomImageName.js';

// Namespace imports
import * as utils from './utils/index.js';
```

**Export Pattern**:
```javascript
// Named exports (most common)
export async function functionName() { }
export const variableName = value;

// Default exports
export default function createApp() { }

// Barrel/index files
export { default as randomImageName } from './randomImageName.js';
export { signAccessToken, signRefreshToken } from './jwtTokens.js';
```

**Critical for TypeScript**:
- All imports must keep `.js` extensions (TypeScript doesn't change them)
- Named exports preferred for better type inference
- Barrel exports work well with TypeScript

---

## Architectural Patterns

### 1. Dependency Injection

**Rate Limiters**:
```javascript
// server.js
const app = createApp({ authLimiter, browsingLimiter, bookingLimiter });

// app.js
function createApp(rateLimiters) {
  const { authLimiter, browsingLimiter, bookingLimiter } = rateLimiters;
  app.use('/api/v1/auth', authLimiter, authRoutes);
}
```

### 2. Factory Pattern

**Middleware Factories**:
```javascript
function createRoleMiddleware(roleCheckFunc) {
  return async function(req, res, next) { /* ... */ };
}

export const verifyUserJWT = createRoleMiddleware((role_id) => role_id >= 1);
```

### 3. Database Transaction Pattern

**Standard Transaction**:
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  // Multiple queries
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### 4. Error Handling

**Express Error Propagation**:
```javascript
router.get('/path', async (req, res, next) => {
  try {
    // Logic
    res.json(data);
  } catch (error) {
    next(error);  // Propagate to error middleware
  }
});

// Error middleware in app.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    status: err.status || 500
  });
});
```

---

## Dependencies Analysis

### Production Dependencies

| Package | Version | TypeScript Support | @types Needed |
|---------|---------|-------------------|---------------|
| express | 5.1.0 | Partial | @types/express |
| mysql2 | 3.14.1 | Built-in | No |
| redis | 5.7.0 | Built-in | No |
| bcrypt | 6.0.0 | Partial | @types/bcrypt |
| jsonwebtoken | 9.0.2 | Partial | @types/jsonwebtoken |
| express-validator | 7.2.1 | Built-in | No |
| sharp | 0.34.3 | Partial | @types/sharp |
| multer | 2.0.1 | Partial | @types/multer |
| @aws-sdk/client-s3 | 3.844.0 | Built-in | No |
| @sendgrid/mail | 8.1.5 | Partial | @types/sendgrid__mail |
| axios | 1.9.0 | Built-in | No |
| cors | 2.8.5 | Partial | @types/cors |
| cookie-parser | 1.4.7 | Partial | @types/cookie-parser |
| dayjs | 1.11.13 | Built-in | No |
| dotenv | 17.2.0 | Partial | @types/node |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| jest | 30.0.5 | Test framework |
| supertest | 7.0.0 | HTTP testing |
| nodemon | 3.1.10 | Development reload |
| cross-env | 7.0.3 | Cross-platform env vars |

### Required @types Packages for Migration

```bash
npm install --save-dev \
  @types/node \
  @types/express \
  @types/jsonwebtoken \
  @types/bcrypt \
  @types/cookie-parser \
  @types/cors \
  @types/multer \
  @types/sharp \
  @types/jest \
  @types/supertest
```

---

## Testing Architecture

### Jest Configuration (jest.config.js)

```javascript
export default {
  testEnvironment: 'node',
  transform: {},  // No transformation (raw JS ES modules)
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js'
  ],
  testTimeout: 30000,
  maxWorkers: 1,  // Single worker to avoid parallel issues
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/utils/testSetup.js']
};
```

### Test Organization

**Unit Tests** (in utils/ folder):
- `utils/randomImageName.test.js`
- `utils/CombineGenresIdNames.test.js`
- `utils/CombineQualitiesIdNames.test.js`

**Integration Tests** (`__tests__/integration/`):
- Complete API endpoint testing
- Database setup/teardown
- 200+ tests across 10 test suites

**Test Scripts**:
```bash
npm test                    # All tests
npm run test:unit          # Only utils/*.test.js
npm run test:integration   # Only __tests__/integration/
npm run test:ratelimiting  # Only __tests__/ratelimiting/
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Test Patterns

**Unit Test Pattern**:
```javascript
import randomImageName from './randomImageName.js';

describe('randomImageName', () => {
  test('should return a string of 64 characters', () => {
    const name = randomImageName();
    expect(name).toHaveLength(64);
  });
});
```

**Integration Test Pattern**:
```javascript
import { jest } from '@jest/globals';
import request from 'supertest';

jest.mock('../../api/emailClient.js');

const { default: createApp } = await import('../../app.js');

const noRateLimit = (req, res, next) => next();
const app = createApp({
  authLimiter: noRateLimit,
  browsingLimiter: noRateLimit,
  bookingLimiter: noRateLimit
});

describe('Auth Integration Tests', () => {
  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'test', email: 'test@example.com', password: 'Test123!' });
    expect(response.status).toBe(201);
  });
});
```

### Test Utilities

**Database Test Utils** (`__tests__/utils/dbTestUtils.js`):
- Creates/drops test database
- Reads SQL from `__tests__/utils/init.sql`
- Setup/cleanup/reset functions

**JWT Test Utils** (`__tests__/utils/jwtTestUtils.js`):
- Helper utilities for token generation in tests

**Test Setup** (`__tests__/utils/testSetup.js`):
- Loads `.test.env`
- Clears Redis databases
- Mocks console functions

---

## Database Schema Overview

### Core Tables

**movies**:
```sql
CREATE TABLE movies (
  movie_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  poster_img_name VARCHAR(255),
  description TEXT,
  age_rating VARCHAR(10),
  is_team_pick BOOLEAN,
  score DECIMAL(3,1),
  length INT,
  created_at TIMESTAMP,
  isDeleted BOOLEAN
);
```

**users**:
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(100) UNIQUE,
  user_email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INT,
  isVerified BOOLEAN,
  refresh_token_version INT,
  created_at TIMESTAMP
);
```

**screenings**:
```sql
CREATE TABLE screenings (
  screening_id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT,
  cinema_id INT,
  room_id INT,
  start_date DATE,
  start_time TIME,
  end_time TIME,
  isDeleted BOOLEAN
);
```

### Important Column Naming Notes

- Cinemas use `cinema_adresse` (French spelling - keep for compatibility)
- Seats use `isAccesible` (missing 's' - keep for compatibility)
- Reviews table is `movies_reviews` (plural movies)
- Boolean fields use `isDeleted`, `isVerified` (camelCase)

---

## TypeScript Migration Considerations

### 1. File Structure
✅ No changes needed - current structure mirrors TypeScript conventions

### 2. Export Patterns
✅ Named exports ideal for TypeScript type inference

### 3. Service Layer
✅ Controllers are pure async functions - easy to type

### 4. Database Queries
⚠️ Need typed query builders or explicit type parameters

### 5. Environment Variables
⚠️ Consider typed config object

### 6. Middleware
✅ Factory pattern works well with TypeScript generics

### 7. Testing
⚠️ Jest needs ts-jest transformer and configuration updates

### 8. Error Handling
⚠️ Custom error classes would improve type safety

---

## Critical Migration Paths

### Bottom-Up Dependency Order

1. **Config** (no dependencies)
   - env.js → env.ts
   - mysqlConnect.js → mysqlConnect.ts
   - redisConnect.js → redisConnect.ts

2. **Utils** (depend on config only)
   - All utils/*.js → utils/*.ts

3. **Middleware** (depend on utils)
   - All middleware/*.js → middleware/*.ts

4. **API Clients** (depend on config)
   - api/awsS3Client.js → api/awsS3Client.ts
   - api/emailClient.js → api/emailClient.ts

5. **Controllers** (depend on config + utils + api)
   - All controllers/*.js → controllers/*.ts

6. **Routes** (depend on everything)
   - All routes/*.js → routes/*.ts

7. **App Core** (depends on routes)
   - app.js → app.ts
   - server.js → server.ts

8. **Tests** (migrate last)
   - Test utilities first
   - Unit tests second
   - Integration tests last

---

## Estimated Complexity

### Low Complexity (1-2 hours each)
- Config files (3 files)
- Utils (7 files)
- API clients (2 files)
- Test utilities (3 files)

### Medium Complexity (2-4 hours each)
- Middleware (4 files)
- Simple controllers (users, cinemas, tickets)
- Simple routes (users, cinemas, tickets)
- Unit tests (3 files)

### High Complexity (4-8 hours each)
- Complex controllers (auth, movies, screenings)
- Complex routes (auth, movies, screenings, checkout)
- App core (app.js, server.js)
- Integration tests (10+ files)

### Very High Complexity (1-2 days)
- Jest configuration for TypeScript + ES modules
- Docker build configuration
- Type definition files (database.ts, express.d.ts)

---

## Total Estimated Effort

- **Phase 0 (Setup)**: 1 day
- **Phase 1 (Infrastructure)**: 2-3 days
- **Phase 2 (Business Logic)**: 3-4 days
- **Phase 3 (Routes)**: 2-3 days
- **Phase 4 (App Core)**: 1 day
- **Phase 5 (Tests)**: 2-3 days
- **Phase 6 (Build/Docker)**: 1 day

**Total**: 13-15 days (assuming part-time work, 3-4 hours/day)
