import express, { Request, Response, RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import usersRoutes from  './routes/users.js'
import moviesRoutes from  './routes/movies.js'
import screeningsRoutes from  './routes/screenings.js'
import ticketsRoutes from  './routes/tickets.js'
import checkoutRoutes from  './routes/checkout.js'
import authRoutes from  './routes/auth.js'
import cinemasRoutes from  './routes/cinemas.js'
import { sendContactAcknowledgment, sendContactMessage } from './api/emailClient.js';
import { errorHandler } from './middleware/errorHandler.js';
import { respondWithJson } from './utils/responses.js';

// App factory function with dependency injection for rate limiters
interface RateLimiters {
  authLimiter: RequestHandler ;
  browsingLimiter: RequestHandler;
  bookingLimiter: RequestHandler;
}
export default function createApp(rateLimiters: RateLimiters) {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // CORS configuration
  const allowedOrigins = [
    process?.env.FRONTEND_URL || 'http://localhost:3000',
    'https://localhost', // Capacitor Android apps
    'capacitor://localhost', // Capacitor iOS apps
    'ionic://localhost', // Ionic apps
    'http://localhost', // Capacitor alternative
  ];
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  // Use injected rate limiters
  const { authLimiter, browsingLimiter, bookingLimiter } = rateLimiters;

  app.use('/api/v1/auth',        authLimiter,     authRoutes       );
  app.use('/api/v1/users',       browsingLimiter, usersRoutes      );
  app.use('/api/v1/movies',      browsingLimiter, moviesRoutes     );
  app.use('/api/v1/screenings',  browsingLimiter, screeningsRoutes );
  app.use('/api/v1/checkout',    bookingLimiter,  checkoutRoutes   );
  app.use('/api/v1/tickets',     browsingLimiter, ticketsRoutes    );
  app.use('/api/v1/cinemas',     browsingLimiter, cinemasRoutes    );

  app.get('/', (_, res: Response) => {
      res.send('Hello from the backend!');
  });

  app.post("/api/v1/messages", async (req: Request, res: Response) => {
      await sendContactMessage({
          name : req.body.message_sender_name,
          email : req.body.message_sender_email,
          subject : req.body.message_subject,
          message : req.body.message_text,
      })
      await sendContactAcknowledgment({
          name : req.body.message_sender_name,
          email : req.body.message_sender_email,
          subject : req.body.message_subject,
          message : req.body.message_text,
      })
      respondWithJson(res, {message:"Message sent succesfully"});
  })

  app.use(errorHandler);

  return app;
}