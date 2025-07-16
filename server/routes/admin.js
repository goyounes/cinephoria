import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { getMessages } from '../controllers/messages.js';
import  { verifyEmployeeJWT} from '../controllers/auth.js';


router.get('/', (req, res) => {
  res.send('Admin dashboard');
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

router.get("/messages", verifyEmployeeJWT, async (req,res,next) => {
    try {
        const messages = await getMessages()
        res.status(200).json(messages)
    } catch (error) {
        next(error)
    }
})

export default router;