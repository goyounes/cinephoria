import { Router } from 'express';
const router = Router();
import axios from 'axios';
import {getAllScreeningsAdmin, getUpcomingScreenings, getUpcomingScreeningDetailsById, getScreeningDetailsByIdAdmin, addScreening} from '../controllers/screenings.js'; 
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';
import {CombineGenresIdNames, CombineQualitiesIdNames} from '../utils/index.js';

// Code below will be needed when eventally i have a screening dashboard for admins that needs filter functions
// router.get("/",async (req,res,next) => {
//     const cinema_id = req.query.cinema_id || null;
//     const movie_id = req.query.movie_id || null;
//     try {
//         const url = new URL(DB_API_URL+"/screenings");
//         if (cinema_id) url.searchParams.routerend("cinema_id", cinema_id);
//         if (movie_id) url.searchParams.routerend("movie_id", movie_id);

//         const response = await axios.get(url,{headers:{'X-Requested-By': 'backend-server'}})
//         const screenings = response.data
//         // res.status(200).render("pages/screenings.ejs",{screenings})
//         res.status(200).json(response.data)
//     } catch (error) {
//         next(error)
//     }
// })

router.get("/", verifyEmployeeJWT, async (req,res,next) => {
    try {
        const screenings = await getAllScreeningsAdmin()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.post('/', verifyEmployeeJWT, async (req, res,next) => {

    if (!req.body.movie_id) { // we can add more validation using express-validator
        const err = new Error("Missing movie id");
        err.status = 400;
        return next(err); 
    }
   
    try {

        console.log("hello")

        const result = await addScreening({
            cinema_id : req.body.cinema_id  , 
            movie_id : req.body.movie_id , 
            room_ids : req.body.room_id , //
            start_date : req.body.start_date , //
            start_time : req.body.start_time , //
            end_time : req.body.end_time , //
        })
        

        res.status(201).json({
            message: "Screening added successfully to the database",
            screening: req.body,
            screeningInsertResult: result,
        });

    } catch (error) {
        //delete the image if the add movie operation fails
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

export default router;