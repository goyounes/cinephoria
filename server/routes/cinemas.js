import { Router } from 'express';
const router = Router();
import {getCinemas, getRooms, getSeats} from '../controllers/cinemas.js'; 

router.get("/", async (req,res,next) => {
    try {
        const messages = await getCinemas()
        res.status(200).json(messages)
    } catch (error) {
        next(error)
    }
})

export default router;