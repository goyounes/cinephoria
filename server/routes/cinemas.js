import { Router } from 'express';
const router = Router();
import {getCinemas, getRooms, getSeats} from '../controllers/cinemas.js'; 

router.get("/", async (req,res,next) => {
    try {
        const cinemas = await getCinemas()
        res.status(200).json(cinemas)
    } catch (error) {
        next(error)
    }
})

router.get("/rooms", async (req,res,next) => {
    try {
        const rooms = await getRooms()
        res.status(200).json(rooms)
    } catch (error) {
        next(error)
    }
})

export default router;