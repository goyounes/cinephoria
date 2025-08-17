import createApp from "./app.js";
import { 
  authLimiter, 
  browsingLimiter, 
  bookingLimiter 
} from './config/rateLimiters.js';
import { testConnectionWithRetry } from './config/mysqlConnect.js';

const PORT = process.env.PORT || 8080;

// Create app with production rate limiters
const app = createApp({
  authLimiter,
  browsingLimiter,
  bookingLimiter
});

// Test database connection before starting server
await testConnectionWithRetry();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});