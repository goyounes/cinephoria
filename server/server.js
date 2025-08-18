import './config/env.js';

import cors from 'cors';
import createApp from "./app.js";
import { 
  authLimiter, 
  browsingLimiter, 
  bookingLimiter 
} from './config/rateLimiters.js';
import { testConnectionWithRetry } from './config/mysqlConnect.js';
import { testRedisConnectionWithRetry } from './config/redisConnect.js';

const PORT = process.env.PORT || 8080;

// Create app with production rate limiters
const app = createApp({
  authLimiter,
  browsingLimiter,
  bookingLimiter
});

// Add CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Test database and Redis connections before starting server
await testConnectionWithRetry();
await testRedisConnectionWithRetry();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});