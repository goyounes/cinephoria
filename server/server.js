import createApp from "./app.js";
import { 
  authLimiter, 
  browsingLimiter, 
  bookingLimiter 
} from './config/rateLimiters.js';

const PORT = process.env.PORT || 8080;

// Create app with production rate limiters
const app = createApp({
  authLimiter,
  browsingLimiter,
  bookingLimiter
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});