import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { addMessage, getMessages } from '../controllers/messages.js';
import  { verifyEmployeeJWT} from '../controllers/auth.js';
import { sendContactAcknowledgment, sendContactMessage } from '../api/emailClient.js';


router.get('/', (req, res) => {
  res.send('Admin dashboard');
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;