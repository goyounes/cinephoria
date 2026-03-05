import { Router, Request, Response } from 'express';
const router = Router();
import { addCinema, getCinemas, getRooms, addRoom, getSeats, deleteRoomById, updateRoom, updateCinema } from '../controllers/cinemas.js';
import { verifyAdminJWT, verifyEmployeeJWT } from '../middleware/authMiddleware.js';

// Cache middleware imports
import {
    tryCache,
    saveToCache,
    invalidateCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { respondWithJson } from '../utils/responses.js';
import { parseIdParam } from '../utils/routeHelpers.js';

router.get("/",
    tryCache('cache:cinemas', CACHE_TTL.STATIC_DATA),
    async (req: Request, res: Response) => {
        const cinemas = await getCinemas();
        respondWithJson(res, cinemas);
        saveToCache(req, cinemas);
    });

router.post("/", verifyEmployeeJWT,
    async (req: Request, res: Response) => {
        const newCinema = await addCinema(req.body);
        respondWithJson(res, newCinema, 201);
        invalidateCache('cinemas');
    });

router.get("/rooms",
    tryCache('cache:rooms', CACHE_TTL.STATIC_DATA),
    async (req: Request, res: Response) => {
        const rooms = await getRooms();
        respondWithJson(res, rooms);
        saveToCache(req, rooms);
    });

router.post("/rooms", verifyEmployeeJWT,
    async (req: Request, res: Response) => {
        const newRoom = await addRoom(req.body);
        respondWithJson(res, newRoom, 201);
        invalidateCache('cinemas');
    });

router.put("/rooms/:id", verifyEmployeeJWT,
    async (req: Request, res: Response) => {
        const id = parseIdParam(req, "Room");
        const { room_name, room_capacity, cinema_id } = req.body;

        if (!room_name || !room_capacity || !cinema_id) {
            throw new BadRequestError("room_name, room_capacity, and cinema_id are required");
        }

        const { result, updatedRoom } = await updateRoom(id, req.body);

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Room with ID ${id} not found`);
        }

        respondWithJson(res, updatedRoom);
        invalidateCache('cinemas');
    });

router.delete("/rooms/:id", verifyEmployeeJWT,
    async (req: Request, res: Response) => {
        const id = parseIdParam(req, "Room");
        const deleteResult = await deleteRoomById(id);
        respondWithJson(res, { message: "room deleted succesfully" });
        invalidateCache('cinemas');
    });

//update cinema
router.put("/:id", verifyEmployeeJWT,
    async (req: Request, res: Response) => {
        const id = parseIdParam(req, "Cinema");
        const { cinema_name, cinema_adresse } = req.body;

        if (!cinema_name || !cinema_adresse) {
            throw new BadRequestError("cinema_name and cinema_adresse are required");
        }

        const { result, updatedCinema } = await updateCinema(id, req.body);

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Cinema with ID ${id} not found`);
        }

        respondWithJson(res, updatedCinema);
        invalidateCache('cinemas');
    });

export default router;
