import { Router } from 'express';
const router = Router();
import axios from 'axios';
import {getAllScreenings, getUpcomingScreenings, getAllScreeningById} from '../controllers/screenings.js'; 
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';

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
        const screenings = await getAllScreenings()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})

router.post('/', (req, res,next) => {
    // This is a placeholder for the POST route to add a new screening
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
        const screenings = await getUpcomingScreeningById()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})


router.get("/:id", verifyEmployeeJWT ,async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for screening with screening_id =",id)
    try {
        const screenings = await getAllScreeningById(id)
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})



export default router;