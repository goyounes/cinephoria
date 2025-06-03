import { Router } from 'express';
const router = Router();
import axios from 'axios';

const DB_API_URL = "http://localhost:5000/api/v1"


router.get('/', (req, res) => {
  res.send('auth page');
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;