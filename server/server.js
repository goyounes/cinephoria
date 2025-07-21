import './config/env.js';

import experess from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = experess();
const PORT = 8080;

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


// app.get('/tickets', async(req, res) => {
//     try{
//         res.status(200).json(tickets);
//         const tickets = await db.getTickets()
//     } catch (error) {
//         next(error);
//     }

// });
// app.post('/tickets', async(req, res) => {
//     try{
//         await db.addTicket(req.body);
//         res.status(201).json("Ticket added successfully!");
//     } catch (error) {
//         next(error);
//     }
// })


// app.get('/messages', async(req, res) => {
//     try{
//         const messages = await db.getMessages()
//         res.status(200).json(messages);
//     } catch (error) {
//         next(error);
//     }
// });
// app.post('/messages', async(req, res) => {
//     try{
//         await db.addMessage(req.body);
//         res.status(201).json("Message added successfully!");
//     } catch (error) {
//         next(error);
//     }
// })



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

