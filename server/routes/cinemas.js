import { Router } from 'express';
const router = Router();
import {addCinema, getCinemas, getRooms, addRoom, getSeats, deleteRoomById, updateRoom, updateCinema} from '../controllers/cinemas.js'; 
import { verifyAdminJWT, verifyEmployeeJWT } from '../middleware/authMiddleware.js';

// Cache middleware imports
import { 
    tryCache,
    saveToCache,
    invalidateCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';

router.get("/",
    tryCache('cache:cinemas', CACHE_TTL.STATIC_DATA),
    async (req,res,next) => {
    try {
      const cinemas = await getCinemas()
      res.status(200).json(cinemas)
      saveToCache(req, cinemas);
    } catch (error) {
        next(error)
    }
})
router.post("/", verifyEmployeeJWT,
    async (req, res, next) => {
  try {
    const newCinema = await addCinema(req.body);
    res.status(201).json(newCinema);
    invalidateCache('cinemas');
  } catch (err) {
    next(err);
  }
});

router.get("/rooms",
    tryCache('cache:rooms', CACHE_TTL.STATIC_DATA),
    async (req,res,next) => {
    try {
        const rooms = await getRooms()
        res.status(200).json(rooms)
        saveToCache(req, rooms);
    } catch (error) {
        next(error)
    }
})

router.post("/rooms", verifyEmployeeJWT,
    async (req, res, next) => {
  try {
    const newRoom = await addRoom(req.body);
    res.status(201).json(newRoom);
    invalidateCache('cinemas');
  } catch (err) {
    next(err);
  }
});
router.put("/rooms/:id", verifyEmployeeJWT,
    async (req, res) => {
  const id = req.params.id;
  const { room_name, room_capacity, cinema_id } = req.body;

  if (!room_name || !room_capacity || !cinema_id) {
    return res.status(400).json({ message: "room_name, room_capacity, and cinema_id are required" });
  }
  try {
    const { result, updatedRoom } = await updateRoom(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Room with ID ${id} not found` });
    }

    res.status(200).json(updatedRoom);
    invalidateCache('cinemas');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update room" });
  }
});
router.delete("/rooms/:id", verifyEmployeeJWT,
    async (req, res, next) => {
  const id = req.params.id
  try {
    const deleteResult = await deleteRoomById(id);
    res.status(200).json({message: "room deleted succesfully"})
    invalidateCache('cinemas');
  } catch (err) {
    next(err);
  }
});

//update cinema
router.put("/:id", verifyEmployeeJWT,
    async (req, res) => {
  const id = req.params.id;
  const { cinema_name, cinema_adresse } = req.body;

  if (!cinema_name || !cinema_adresse) {
    return res.status(400).json({ message: "cinema_name and cinema_adresse are required" });
  }

  try {
    const { result, updatedCinema } = await updateCinema(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Cinema with ID ${id} not found` });
    }

    res.status(200).json(updatedCinema);
    invalidateCache('cinemas');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update cinema" });
  }
});

export default router;