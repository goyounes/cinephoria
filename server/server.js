import './config/env.js';

import experess from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = experess();
const PORT = process.env.PORT || 8080;

app.use(experess.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000', // ✅ must be specific, not '*'
  credentials: true               // ✅ allow cookies and auth headers
}));

app.use(cookieParser());

import usersRoutes from  './routes/users.js'
import moviesRoutes from  './routes/movies.js'
import screeningsRoutes from  './routes/screenings.js'
import adminRoutes from  './routes/admin.js'
import ticketsRoutes from  './routes/tickets.js'
import checkoutRoutes from  './routes/checkout.js'
import authRoutes from  './routes/auth.js'
import cinemasRoutes from  './routes/cinemas.js'
import { sendContactAcknowledgment, sendContactMessage } from './api/emailClient.js';


app.use('/api/users', usersRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/screenings', screeningsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cinemas', cinemasRoutes);


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
    error: {
      message: err.message || "Something broke in the web server !",
      status: err.status || 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

