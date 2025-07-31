import { Router } from 'express';
const router = Router();
import {addCinema, getCinemas, getRooms, addRoom, getSeats} from '../controllers/cinemas.js'; 
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';

router.get("/", async (req,res,next) => {
    try {
        const cinemas = await getCinemas()
        res.status(200).json(cinemas)
    } catch (error) {
        next(error)
    }
})
router.post("/", verifyEmployeeJWT ,async (req, res, next) => {
  try {
    const newCinema = await addCinema(req.body);
    res.status(201).json(newCinema);
  } catch (err) {
    next(err);
  }
});

router.get("/rooms", async (req,res,next) => {
    try {
        const rooms = await getRooms()
        res.status(200).json(rooms)
    } catch (error) {
        next(error)
    }
})

router.post("/rooms", verifyEmployeeJWT, async (req, res, next) => {
  try {
    const newRoom = await addRoom(req.body);
    res.status(201).json(newRoom);
  } catch (err) {
    next(err);
  }
});

export default router;