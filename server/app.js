import './config/env.js';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(cors());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

import { 
  authLimiter, 
  browsingLimiter, 
  bookingLimiter 
} from './config/rateLimiters.js';

import usersRoutes from  './routes/users.js'
import moviesRoutes from  './routes/movies.js'
import screeningsRoutes from  './routes/screenings.js'
import ticketsRoutes from  './routes/tickets.js'
import checkoutRoutes from  './routes/checkout.js'
import authRoutes from  './routes/auth.js'
import cinemasRoutes from  './routes/cinemas.js'
import { sendContactAcknowledgment, sendContactMessage } from './api/emailClient.js';


app.use('/api/auth',        authLimiter,     authRoutes       );
app.use('/api/users',       browsingLimiter, usersRoutes      );
app.use('/api/movies',      browsingLimiter, moviesRoutes     );
app.use('/api/screenings',  browsingLimiter, screeningsRoutes );
app.use('/api/checkout',    bookingLimiter,  checkoutRoutes   );
app.use('/api/tickets',     browsingLimiter, ticketsRoutes    );
app.use('/api/cinemas',     browsingLimiter, cinemasRoutes    );


app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.post("/api/messages", async (req,res,next) => {
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
        next(error)
    }
})


app.use((err, req, res, next) => {
  console.log("Server: Middleware logging error stack ...");
  console.error(err.stack); // Log the stack trace
  // res.status(err.status || 500).send(err.message || "Something broke in the web server !");
  res.status(err.status || 500).json({
      message: err.message || "Something broke in the web server !",
      status: err.status || 500
  });
});

export default app;

