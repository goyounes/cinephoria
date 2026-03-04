# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cinephoria is a full-stack cinema booking application with separate client and server applications, containerized with Docker and orchestrated using Docker Compose. The system manages movies, cinemas, screenings, user authentication, and ticket bookings.

## Architecture

### Stack
- **Frontend**: React 19 with Material-UI, React Router, and Create React App
- **Backend**: Node.js with Express, using ES modules
- **Database**: MySQL 8.0 with Redis for caching/sessions
- **Containerization**: Docker with separate containers for client, server, MySQL, Redis, and nginx
- **File Storage**: AWS S3 integration
- **Email**: SendGrid integration

### Project Structure
```
├── client/          # React frontend application
├── server/          # Node.js Express backend
├── db/              # MySQL initialization scripts
├── nginx/           # Nginx configuration for reverse proxy
├── diagrams/        # System diagrams and documentation
├── Docker-compose.dev.yaml   # Development environment
└── Docker-compose.prod.yaml  # Production environment
```

## Development Commands

### Client (Frontend)
```bash
cd client
npm start          # Development server on http://localhost:3000
npm test           # Run test suite
npm run build      # Production build
```

### Server (Backend)
```bash
cd server
npm run dev        # Development server with nodemon on port 8080
npm start          # Production server
```

### Testing Commands
```bash
cd server
npm run test                    # Run all tests (unit + integration)
npm run test:unit              # Run only unit tests (excludes test/ folder)
npm run test:integration       # Run only integration tests
npm test -- FILENAME.test.js -- --verbose  # Run specific test file with verbose output
```

### Docker Development Environment
```bash
# Start all services (MySQL, Redis, Backend, Frontend, Nginx)
docker-compose -f Docker-compose.dev.yaml up

# Access points:
# - Frontend: http://localhost:3000 (via nginx)
# - Direct React dev server: http://localhost:3001
# - Backend API: http://localhost:8080
# - MySQL: localhost:3306 (exposed in dev)
# - Redis: localhost:6379
```

### Docker Production Environment
```bash
docker-compose -f Docker-compose.prod.yaml up
```

## Server-Side Architecture

### Core Configuration Files
- **`server/config/env.js`**: Environment variable loading with conditional .env file processing
- **`server/config/mysqlConnect.js`**: MySQL connection pool with retry logic and graceful failure handling
- **`server/config/redisConnect.js`**: Redis client with connection state management and error recovery
- **`server/config/rateLimiters.js`**: Custom Redis-based rate limiting implementation

### Authentication & Authorization System

**JWT Token Architecture**:
- **Access Tokens**: 15-minute expiry, contain user_id, role_id, role_name
- **Refresh Tokens**: 7-day expiry, stored as HTTP-only cookies with token versioning
- **Token Blacklisting**: Redis-based revocation system for logout functionality

**Role-Based Middleware** (`server/controllers/auth.js`):
- `verifyUserJWT`: Role level 1+ (regular users)
- `verifyEmployeeJWT`: Role level 2+ (admin users)
- `verifyAdminJWT`: Role level 3 (super admin only)

**Password Security**:
- bcrypt with salt rounds of 10
- Separate `users_credentials` table for password isolation
- Password reset with JWT tokens (15-minute expiry)

**Email Verification**:
- JWT-based email verification tokens (1-hour expiry)
- Automatic re-verification on login attempts for unverified users
- SendGrid integration for verification and password reset emails

### Database Architecture

**Connection Management**:
- MySQL2 promise-based connection pool with retry logic
- Automatic connection testing with configurable retry attempts (10 max, 5s intervals)
- Transaction support with proper rollback handling
- `dateStrings: true` configuration for consistent date handling

**Complete Database Schema**:

**Core Tables**:
- `genres` (genre_id, genre_name)
- `movies` (movie_id, title, poster_img_name, description, age_rating, is_team_pick, score, length, created_at, isDeleted)
- `movie_genres` (movie_id, genre_id) - many-to-many relationship
- `cinemas` (cinema_id, cinema_name, cinema_adresse, isDeleted) - NOTE: uses 'adresse' not 'address'
- `rooms` (room_id, room_name, room_capacity, isDeleted, cinema_id)
- `seats` (seat_id, seat_number, isAccesible, isDeleted, room_id) - NOTE: 'isAccesible' spelling
- `screenings` (screening_id, movie_id, cinema_id, room_id, start_date, start_time, end_time, isDeleted)
- `qualities` (quality_id, quality_name) - 4DX, 3D, 4K, FHD
- `screening_qualities` (screening_id, quality_id) - many-to-many relationship

**User Management**:
- `roles` (role_id, role_name) - 0:visitor, 1:user, 2:employee, 3:admin
- `users` (user_id, user_name, user_email, first_name, last_name, role_id, isVerified, refresh_token_version, created_at)
- `users_credentials` (user_id, user_password_hash, created_at, updated_at, failed_attempts)

**Reviews & Bookings**:
- `movies_reviews` (review_id, movie_id, user_id, score, review, created_at) - NOTE: 'movies_reviews' not 'movie_reviews'
- `ticket_types` (ticket_type_id, ticket_type_name, ticket_type_price)
- `tickets` (ticket_id, ticket_type_id, screening_id, user_id, seat_id, QR_code, created_at)

**Important Column Name Notes**:
- Cinemas use `cinema_adresse` (French spelling)
- Seats use `isAccesible` (missing 's')
- Reviews table is `movies_reviews` (plural movies)
- Screenings separate `start_date`, `start_time`, `end_time` (not combined datetime)
- Many boolean fields use `isDeleted`, `isVerified` (camelCase)

### Rate Limiting System

**Custom Redis Implementation** (`server/config/rateLimiters.js`):
- **Auth Limiter**: 100 requests per 15 minutes
- **Browsing Limiter**: 100 requests per minute
- **Booking Limiter**: 10 requests per hour
- User-aware rate limiting (uses user_id when authenticated, IP otherwise)
- Graceful degradation when Redis is unavailable

### API Route Organization

**Route Structure** (All routes use `/api/v1/` versioning):
```
/api/v1/auth        # Authentication endpoints (registration, login, password reset)
/api/v1/users       # User management (admin-only user creation)
/api/v1/movies      # Movie CRUD with image upload to S3
/api/v1/screenings  # Screening management with availability logic
/api/v1/cinemas     # Cinema and room management
/api/v1/tickets     # Ticket booking and retrieval
/api/v1/checkout    # Payment processing endpoints
/api/v1/messages    # Contact form email handling
```

**Input Validation**:
- Express-validator for comprehensive request validation
- Custom validation rules (email domains, password complexity)
- Centralized validation error handling

### File Upload & Storage

**AWS S3 Integration**:
- Multer for memory-based file processing
- Sharp for image optimization and resizing
- Presigned URLs for secure file access
- Automatic file naming with UUID generation
- Environment-based bucket configuration

### Email System

**SendGrid Integration** (`server/api/emailClient.js`):
- **Verification emails**: Account activation with styled HTML templates
- **Password reset**: Secure reset links with expiration
- **Contact form**: Dual email system (to admin + user acknowledgment)
- Professional email templates with fallback text versions

### Environment Configuration

**Required Environment Variables**:
```bash
# Database
MYSQL_HOST=mysql_dev
MYSQL_USER=root
MYSQL_PASSWORD=5599
MYSQL_DATABASE=cinephoria

# Redis
REDIS_HOST=redis_dev

# JWT Secrets
ACCESS_JWT_SECRET=your_access_secret
REFRESH_JWT_SECRET=your_refresh_secret
EMAIL_VERIFICATION_SECRET=your_email_secret
PASSWORD_RESET_SECRET=your_password_secret

# External Services
SENDGRID_API_KEY=your_sendgrid_key
S3_BUCKET_NAME=your_bucket
S3_BUCKET_REGION=your_region
S3_BUCKET_ACCES_KEY=your_access_key
S3_BUCKET_SECRET_ACCES_KEY=your_secret_key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

## Key Features

### User Roles and Permissions
- **Level 1**: Regular users (booking, account management)
- **Level 2**: Admin users (manage movies, cinemas, screenings, view tickets)
- **Level 3**: Super admin (user management)

### Core Functionality
- Movie browsing with filtering and search
- Cinema and screening management
- Seat reservation system
- Payment processing integration
- QR code ticket generation
- Email notifications
- Admin statistics and reporting

## Development Patterns

### Backend Standards
- **ES Modules**: Use import/export syntax throughout
- **Async/Await**: Consistent promise handling
- **Database Transactions**: Always use for multi-table operations
- **Error Propagation**: Use next(error) for consistent error handling
- **Connection Management**: Always release database connections in finally blocks
- **Input Validation**: Use express-validator for all user inputs
- **HTTP Status Codes**: Use appropriate status codes (200, 201, 400, 401, 403, 404, 500)

### Frontend Standards
- Functional components with hooks
- Material-UI for consistent styling
- Context for global state management
- Responsive design patterns
- Error boundary and user feedback via snackbars

## Important File Locations

- **Server Entry**: `server/server.js` - Simple Express server startup
- **App Configuration**: `server/app.js` - Express app setup with middleware
- **Authentication Logic**: `server/controllers/auth.js` - Complete auth system
- **Database Models**: `server/controllers/` - Business logic for each resource
- **API Routes**: `server/routes/` - Route definitions with validation
- **Utilities**: `server/utils/` - Helper functions and middleware
- **Database Init**: `db/init.sql` - Complete schema and seed data

## Docker & Containerization

### Sharp Module Cross-Platform Problem
**Issue**: Sharp (image processing library) fails to load in Docker Linux containers when package-lock.json is generated on Windows.

**Solution**: In `server/Dockerfile`, only copy `package.json` (not `package-lock.json`) to allow npm to generate platform-appropriate dependencies:
```dockerfile
# CORRECT - Only copy package.json
COPY package.json ./
RUN npm install
```

### Hot Reloading with Volume Mounts
**Current Docker Compose Strategy**:
```yaml
volumes:
  - ./server:/app                    # Full directory mount
  - node_modules_server_dev:/app/node_modules  # Named volume to protect node_modules
```

## Testing Architecture

### Test Organization
Tests are separated into unit and integration tests:

**Unit Tests** (in `utils/` folder):
- `randomImageName.test.js`
- `CombineGenresIdNames.test.js` 
- `CombineQualitiesIdNames.test.js`

**Integration Tests** (in `__tests__/integration/` folder):
- Complete API endpoint testing with database
- 200+ tests across 10 test suites covering all major functionality

### Test Scripts
```bash
npm run test              # Run all tests (unit + integration)
npm run test:unit         # Run only unit tests (excludes test/ folder)
npm run test:integration  # Run only integration tests
npm test -- FILENAME.test.js -- --verbose  # Run specific test file with verbose output
```

### Test Configuration
- **Deprecation Warning Suppression**: All test scripts include `--no-deprecation` flag
- **VM Modules**: Uses `--experimental-vm-modules` for ES modules in Jest
- **Console Mocking**: `server/config/testSetup.js` contains optional console suppression for cleaner test output

### Database Schema Notes for Testing
- **seat_number**: INT (not string) - use numeric values like `99`, not `'A1'`
- **Integration tests**: Require database setup with proper foreign key relationships
- **Test data**: Use `db/init.sql` as reference for correct data types and relationships

## Critical Development Notes

### Package Management
- **NEVER commit package-lock.json** from Windows if deploying to Linux containers
- Sharp dependency requires platform-specific compilation
- Use Docker volume mounts carefully to avoid overriding compiled dependencies

### Database Column Naming
- Many typos exist in column names (e.g., `cinema_adresse`, `isAccesible`)
- Maintain consistency with existing schema rather than fixing typos to avoid breaking changes

### Security Considerations
- JWT tokens use proper expiration times (15min access, 7day refresh)
- Password hashing uses bcrypt with appropriate salt rounds
- Rate limiting implemented with Redis backing
- Input validation on all endpoints using express-validator

## Deployment Guide

### Build All Images for Production
```bash
# Build custom images and pull pre-built ones (all images ready without running containers)
docker compose -f Docker-compose.prod.yaml build; docker compose -f Docker-compose.prod.yaml pull
```

### Start Production Deployment
```bash
# Start all services using pre-built images
docker compose -f Docker-compose.prod.yaml up -d
```

### Stop Production Deployment
```bash
docker compose -f Docker-compose.prod.yaml down
```

### GitHub Actions Docker Hub Integration
**Required GitHub Secrets:**
- `DOCKERHUB_USERNAME` = Docker Hub username
- `DOCKERHUB_TOKEN` = Docker Hub access token (not password)

## API Versioning Migration (v1)

### ✅ Complete Migration to /api/v1/ (Latest Update)

**Migration Summary**: All API endpoints have been successfully migrated from `/api/` to `/api/v1/` for proper versioning.

**Components Updated**:
- **Server Routes**: All 8 route handlers in `server/app.js` updated to use `/api/v1/` prefix
- **Nginx Configuration**: Both dev and prod configs updated to proxy `/api/v1/` requests
- **Client Application**: All 60 API calls across 29 React components updated
- **Integration Tests**: All 200+ test cases across 10 test suites updated
- **Rate Limiting Tests**: All rate limiting endpoints updated

**Affected Endpoints**:
```
/api/v1/auth/*         # All authentication endpoints
/api/v1/users/*        # User management endpoints  
/api/v1/movies/*       # Movie CRUD and related endpoints
/api/v1/screenings/*   # Screening management endpoints
/api/v1/cinemas/*      # Cinema and room management
/api/v1/tickets/*      # Ticket booking and retrieval
/api/v1/checkout/*     # Payment processing
/api/v1/messages       # Contact form submission
```

**Benefits**:
- **API Versioning**: Proper semantic versioning for future API changes
- **Backwards Compatibility**: Clear upgrade path for API consumers
- **Professional Standards**: Industry-standard REST API versioning
- **Future-Proofing**: Easy to introduce v2 endpoints without breaking existing clients

**Testing Status**: All integration tests updated and passing with new versioned endpoints.

**Deployment Impact**: This is a breaking change requiring coordinated deployment of server, client, and nginx configurations.

## Docker Image Optimization (TODO - Fix Tomorrow)

### Current Issue: Sharp Module Platform Mismatch

**Problem**: Docker container exits with Sharp module error:
```
Error: Could not load the "sharp" module using the linux-x64 runtime
```

**Root Cause**: Sharp was installed on Windows but needs Linux binaries when running in Docker container.

### Current Docker Optimization Status

**✅ Completed**:
- Multi-stage build implementation
- Changed from full Debian image to `node:22-slim` (saves ~800MB)
- Enhanced .dockerignore to exclude unnecessary files (__tests__, *.md, etc.)
- Fixed cross-env issue by using `CMD ["node", "server.js"]` and `ENV NODE_ENV=production`
- Added `npm prune --production` to remove dev dependencies

**❌ Still Broken**:
- Sharp module needs platform-specific rebuild for Linux
- Container starts but crashes when Sharp is used

### Solutions to Try Tomorrow

**Option 1: Rebuild Sharp in Docker**
```dockerfile
RUN npm install
RUN npm rebuild sharp
```

**Option 2: Use Different Sharp Installation**
```dockerfile  
RUN npm install
RUN npm uninstall sharp && npm install sharp --platform=linux --arch=x64
```

**Option 3: Install Sharp from Scratch in Container**
```dockerfile
RUN npm install
RUN npm uninstall sharp
RUN npm install sharp --verbose
```

### Expected Final Size
- **Before**: ~1.2GB (full Debian + all deps)  
- **Target**: ~200-300MB (slim + production deps)
- **Current**: Built successfully but crashes on Sharp

### Files Modified
- `server/Dockerfile` - Multi-stage build with node:22-slim
- `server/.dockerignore` - Enhanced to exclude test files and docs

## Security Scanning Setup

### NPM Audit Results
✅ **Server**: Clean - 0 vulnerabilities
❌ **Client**: 9 vulnerabilities (3 moderate, 6 high)
- Issues in react-scripts dependencies (nth-check, postcss, webpack-dev-server)
- Fix available via `npm audit fix --force` but may cause breaking changes

### Security Scanning Tools Available

**1. Trivy (Container & Filesystem Scanner)**
```bash
# Install Trivy via Docker (recommended)
docker run --rm -v "${PWD}:/workspace" aquasec/trivy:latest fs --security-checks vuln,secret /workspace

# Scan specific Docker images
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cinephoria-server:latest

# Scan for secrets only
docker run --rm -v "${PWD}:/workspace" aquasec/trivy:latest fs --security-checks secret /workspace
```

**2. SonarQube (Code Quality & Security)**
```bash
# Run SonarQube in Docker
docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest

# Access: http://localhost:9000 (admin/admin)
# Requires project token setup for scanning
```

**3. OWASP Dependency Check (JVM-based)**
```bash
# Run via Docker
docker run --rm -v "${PWD}:/src" owasp/dependency-check:latest --scan /src --format ALL --project "Cinephoria"
```

### Security Scan Commands
```bash
# Quick NPM vulnerability scan
cd server && npm audit
cd client && npm audit

# Comprehensive security scan with Trivy
npm run security:scan    # (to be added to package.json)

# Docker image security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image $(docker images --format "{{.Repository}}:{{.Tag}}" | grep cinephoria)
```

### Recommended Security Workflow
1. Run `npm audit` on both client/server before commits
2. Use Trivy for filesystem and secret scanning
3. Scan Docker images before deployment
4. Set up SonarQube for continuous code quality monitoring
5. Address client vulnerabilities in react-scripts dependencies