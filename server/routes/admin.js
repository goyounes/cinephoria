import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { getMessages } from '../controllers/messages.js';
import  { verifyAdminJWT} from '../controllers/auth.js';
const DB_API_URL = "http://localhost:5000/api/v1"

router.get('/', (req, res) => {
  res.send('Admin dashboard');
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

router.get("/messages",verifyAdminJWT, async (req,res,next) => {
    try {
        const messages = await getMessages()
        res.status(200).json(messages)
    } catch (error) {
        next(error)
    }
})

export default router;