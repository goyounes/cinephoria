import { Router } from 'express';
const router = Router();

import {getAllScreeningsAdmin, getUpcomingScreenings, getUpcomingScreeningDetailsById, getScreeningDetailsByIdAdmin, deleteScreeningById, addManyScreenings, updateScreening} from '../controllers/screenings.js'; 
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';
import {CombineGenresIdNames, CombineQualitiesIdNames} from '../utils/index.js';
import dayjs from 'dayjs';


router.get("/", verifyEmployeeJWT, async (req,res,next) => {
    try {
        const screenings = await getAllScreeningsAdmin()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.post('/', verifyEmployeeJWT, async (req, res,next) => {
    const { movie_id, cinema_id, room_ids, start_date, start_time, end_time } = req.body;
    if (!movie_id  || !cinema_id || !room_ids || !start_date || !start_time || !end_time ) { // we can add more validation using express-validator
        const err = new Error("Missing screening data");
        err.status = 400;
        return next(err); 
    }
    if (dayjs(start_date).isBefore(dayjs())) {
        const err = new Error("Date cannot be in the past");
        err.status = 400;
        return next(err); 
    }
    try {

        const result = await addManyScreenings({
            cinema_id , 
            movie_id, 
            room_ids, 
            start_date, 
            start_time, 
            end_time, 
        })
        
        res.status(201).json({
            message: "Screening added successfully to the database",
            screening: req.body,
            screeningInsertResult: result,
        });

    } catch (error) {
        console.error("Error during movie upload process:", error);
        next(error); 
    }

});

router.get("/upcoming", async (req,res,next) => {
    try {
        const screenings = await getUpcomingScreenings()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.get("/upcoming/:id", async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for upcoming screening with screening_id =",id)
    try {
        const rawwscreenings = await getUpcomingScreeningDetailsById(id)
        if (!rawwscreenings) {
            const err = new Error("Screening not found");
            err.status = 404;
            return next(err); 
        }
        const rawscreenings =  CombineGenresIdNames([rawwscreenings])[0] //cheated by submiting an array to the function and then taking the one elment out
        const screenings = CombineQualitiesIdNames([rawscreenings])[0]   //cheated by submiting an array to the function and then taking the one elment out
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})


router.get("/:id", verifyEmployeeJWT, async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for screening with screening_id =",id)
    try {
        const rawwscreenings = await getScreeningDetailsByIdAdmin(id)
        if (!rawwscreenings) {
            const err = new Error("Screening not found");
            err.status = 404;
            return next(err); 
        }
        const rawscreenings =  CombineGenresIdNames([rawwscreenings])[0] //cheated by submiting an array to the function and then taking the one elment out
        const screenings = CombineQualitiesIdNames([rawscreenings])[0] 
        console.log("sending screening details",screenings)
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.put("/:id", verifyEmployeeJWT, async (req, res,next) => {
    const id = req.params.id
    const { movie_id, cinema_id, room_id, start_date, start_time, end_time } = req.body;
    if (!movie_id  || !cinema_id || !room_id || !start_date || !start_time || !end_time ) { // we can add more validation using express-validator
        const err = new Error("Missing screening data");
        err.status = 400;
        return next(err); 
    }
    if (dayjs(start_date).isBefore(dayjs())) {
        const err = new Error("Date cannot be in the past");
        err.status = 400;
        return next(err); 
    }
    try {

        const result = await updateScreening(id,{
            cinema_id, 
            movie_id, 
            room_id, 
            start_date, 
            start_time, 
            end_time, 
        })
        
        res.status(201).json({
            message: "Screening added successfully to the database",
            screening: req.body,
            screeningInsertResult: result,
        });

    } catch (error) {
        console.error("Error during movie upload process:", error);
        next(error); 
    }

});

router.delete("/:id", verifyEmployeeJWT, async (req,res,next) => {
    const id = req.params.id
    console.log("Deleting screening id =",id)
    try {
        const deleteResult = await deleteScreeningById(id)
        res.status(204).json({message: "screening deleted succesfully"})
    } catch (error) {
        next(error)
    }
})

export default router;