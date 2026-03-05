import { Router } from 'express';
export const router = Router();

import {getAllScreeningsAdmin, getUpcomingScreenings, getUpcomingScreeningDetailsById, getScreeningDetailsByIdAdmin, deleteScreeningById, addManyScreenings, updateScreening} from '../controllers/screenings.js';
import { verifyAdminJWT, verifyEmployeeJWT } from '../middleware/authMiddleware.js';
import {CombineGenresIdNames, CombineQualitiesIdNames} from '../utils/index.js';
import dayjs from 'dayjs';

// Cache middleware imports
import {
    tryCache,
    saveToCache,
    invalidateCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { respondWithJson } from '../utils/responses.js';


router.get("/", verifyEmployeeJWT,
    tryCache('cache:screenings:all:admin', CACHE_TTL.SCREENINGS),
    async (req, res) => {
    const screenings = await getAllScreeningsAdmin()
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})

router.post('/', verifyEmployeeJWT,
    async (req, res) => {
    const { movie_id, cinema_id, room_ids, start_date, start_time, end_time } = req.body;
    if (!movie_id  || !cinema_id || !room_ids || !start_date || !start_time || !end_time ) {
        throw new BadRequestError("Missing screening data");
    }
    if (dayjs(start_date).isBefore(dayjs())) {
        throw new BadRequestError("Date cannot be in the past");
    }
    if (!Array.isArray(room_ids) || room_ids.length === 0) {
        throw new BadRequestError("room_ids must be a non-empty array");
    }

    const result = await addManyScreenings({
        cinema_id ,
        movie_id,
        room_ids,
        start_date,
        start_time,
        end_time,
    })

    respondWithJson(res, {
        message: "Screening added successfully to the database",
        screening: req.body,
        screeningInsertResult: result,
    }, 201);
    invalidateCache('screenings');
});

router.get("/upcoming",
    tryCache(`cache:screenings:upcoming:all:all`, CACHE_TTL.SCREENINGS),
    async (req, res) => {
    const screenings = await getUpcomingScreenings()
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})

router.get("/upcoming/:id",
    (req, res, next) => tryCache(`cache:screening:${req.params.id}:details`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req, res) => {
    const id = req.params.id
    console.log("accesing API for upcoming screening with screening_id =",id)

    const rawwscreenings = await getUpcomingScreeningDetailsById(id)
    if (!rawwscreenings) throw new NotFoundError("Screening not found");

    const rawscreenings =  CombineGenresIdNames([rawwscreenings])[0] //cheated by submiting an array to the function and then taking the one elment out
    const screenings = CombineQualitiesIdNames([rawscreenings])[0]   //cheated by submiting an array to the function and then taking the one elment out
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})


router.get("/:id", verifyEmployeeJWT,
    (req, res, next) => tryCache(`cache:screening:${req.params.id}:details`, CACHE_TTL.SCREENINGS)(req, res, next),
    async (req, res) => {
    const id = req.params.id
    console.log("accesing API for screening with screening_id =",id)

    const rawwscreenings = await getScreeningDetailsByIdAdmin(id)
    if (!rawwscreenings) throw new NotFoundError("Screening not found");

    const rawscreenings =  CombineGenresIdNames([rawwscreenings])[0] //cheated by submiting an array to the function and then taking the one elment out
    const screenings = CombineQualitiesIdNames([rawscreenings])[0]
    console.log("sending screening details",screenings)
    respondWithJson(res, screenings);
    saveToCache(req, screenings);
})

router.put("/:id", verifyEmployeeJWT,
    async (req, res) => {
    const id = req.params.id
    const { movie_id, cinema_id, room_id, start_date, start_time, end_time } = req.body;
    if (!movie_id  || !cinema_id || !room_id || !start_date || !start_time || !end_time ) {
        throw new BadRequestError("Missing screening data");
    }
    if (dayjs(start_date).isBefore(dayjs())) {
        throw new BadRequestError("Date cannot be in the past");
    }

    const result = await updateScreening(id,{
        cinema_id,
        movie_id,
        room_id,
        start_date,
        start_time,
        end_time,
    })

    respondWithJson(res, {
        message: "Screening updated successfully to the database",
        screening: req.body,
        screeningInsertResult: result,
    }, 201);
    invalidateCache('screenings');
});

router.delete("/:id", verifyEmployeeJWT,
    async (req, res) => {
    const id = req.params.id
    console.log("Deleting screening id =",id)
    const deleteResult = await deleteScreeningById(id)
    respondWithJson(res, {message: "screening deleted succesfully"});
    invalidateCache('screenings');
})

export default router;
