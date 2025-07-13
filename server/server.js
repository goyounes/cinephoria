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
import ticketsRoutes from  './routes/tickets.js'
import adminRoutes from  './routes/admin.js'
import authRoutes from  './routes/auth.js'

app.use('/users', usersRoutes);
app.use('/movies', moviesRoutes);
app.use('/screenings', screeningsRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);



app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// app.get('/movies', async(req, res) => {
//     try{
//         const movies = await db.getMovies()
//         res.status(200).json(movies);
//     } catch (error) {
//         next(error);
//     }
// });
// app.post('/movies', async(req, res) => {
//     // const { title, description, releaseDate, genre } = req.body || {"title", "description", "releaseDate", "genre"};
//     // Here you would typically insert the movie into the database
//     // For now, we'll just return the received data
//     try {
//         await db.addMovie(req.body);
//         res.status(201).json("Movie added successfully!");
//     } catch (error) {
//         next(error);
//     }
// })


// app.get('/screenings', async(req, res) => {
//     try{
//         const screenings = await db.getScreenings()
//         res.status(200).json(screenings);
//     } catch (error) {
//         next(error);
//     }
// });
// app.post('/screenings', async(req, res) => {
//     try{
//         await db.addScreening(req.body);
//         res.status(201).json("Screening added successfully!");
//     } catch (error) {
//         next(error);
//     }
// })


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
  res.status(err.status || 500).send(err.message || "Something broke in the web server !");
  // res.status(err.status || 500).json({
  //   error: {
  //     message: err.message || "Something broke in the web server !",
  //     status: err.status || 500
  //   }
  // });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

