import experess from 'express';
import cors from 'cors';
const app = experess();
const PORT = 8080;

app.use(cors());
app.use(experess.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});