import { Router } from 'express';
const router = Router();
import axios from 'axios';
import {getAllScreenings} from '../controllers/screenings.js'; 
const DB_API_URL = "http://localhost:5000/api/v1"


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
router.get("/",async (req,res,next) => {
    try {
        const screenings = await getAllScreenings()
        res.status(200).json(screenings)
    } catch (error) {
        next(error)
    }
})


router.get('/create', (req, res,next) => {
    // res.sendFile("/static/create_screening.html",{root:"."})
    // res.status(200).render("pages/create_screening.ejs",{DB_API_URL});
    res.status(200).json({message: "Create screening page not implemented yet. Please use the API directly."})
});

router.get("/all",async (req,res,next) => {
    try {
        const response = await axios.get(DB_API_URL+"/screenings/all",{headers:{'X-Requested-By': 'backend-server'}})
        const screenings = response.data
        // res.status(200).render("pages/screenings.ejs",{screenings})
        res.status(200).json(response.data)
    } catch (error) {
        next(error)
    }
})

router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for screening with screening_id =",id)
    try {
        const response = await axios.get(DB_API_URL + "/screenings/" + id ,{headers:{'X-Requested-By': 'backend-server'}})
        const screening = response.data // either a reosurce obj or err obj
        // if ('error' in screening) throwError (screening.error.message,screening.error.status)
        // res.status(200).render("pages/one_screening.ejs",{screening})
        res.status(200).json(response.data)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;