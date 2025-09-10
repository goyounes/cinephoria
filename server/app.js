import express from 'express';
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

// App factory function with dependency injection for rate limiters
export default function createApp(rateLimiters) {
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

  app.get('/', (req, res) => {
      res.send('Hello from the backend!');
  });

  app.post("/api/v1/messages", async (req,res,next) => {
      try {
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
          res.status(200).json({message:"Message sent succesfully"})
      } catch (error) {
          return next(error)
      }
  })

  app.use((err, req, res, next) => {
    console.log("Server: Middleware logging error stack ...");
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Something broke in the web server !",
        status: err.status || 500
    });
  });

  return app;
}