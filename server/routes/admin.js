import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { addMessage, getMessages } from '../controllers/messages.js';
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

router.post("/messages", async (req,res,next) => {
    try {
        const result = await addMessage({
            message_subject : req.body.message_subject, 
            message_text : req.body.message_text, 
            message_sender_name : req.body.message_sender_name,
            message_sender_email : req.body.message_sender_email
        })
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
})

export default router;