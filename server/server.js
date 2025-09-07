import './config/env.js';

import createApp from "./app.js";
import { 
  authLimiter, 
  browsingLimiter, 
  bookingLimiter 
} from './middleware/rateLimiters.js';
import { testConnectionWithRetry } from './config/mysqlConnect.js';
import { testRedisConnectionWithRetry } from './config/redisConnect.js';

const PORT = process.env.PORT || 8080;

// Create app with production rate limiters
const app = createApp({
  authLimiter,
  browsingLimiter,
  bookingLimiter
});


// Test database and Redis connections before starting server
await testConnectionWithRetry();
await testRedisConnectionWithRetry();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});