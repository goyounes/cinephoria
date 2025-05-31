import experess from 'express';
import cors from 'cors';
import * as db from './database.js';

const app = experess();
const PORT = 8080;

app.use(cors());
app.use(experess.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.get('/movies', async(req, res) => {
    const movies = await db.getMovies()
    res.status(200).json(movies);
});

app.get('/screenings', async(req, res) => {
    const screenings = await db.getScreenings()
    res.status(200).json(screenings);
});

app.get('/tickets', async(req, res) => {
    const tickets = await db.getTickets()
    res.status(200).json(tickets);

});

app.get('/messages', async(req, res) => {
    const messages = await db.getMessages()
    res.status(200).json(messages);

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

