import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { getMovies, getMoviesWithGenres } from '../controllers/movies.js';

const DB_API_URL = "http://localhost:5000/api/v1"

router.get("/",async (req,res,next) => {
    try {
        // const response = await axios.get(DB_API_URL+"/movies")
        // const movies = response.data
        // console.log("response",response)
        const movies = await getMoviesWithGenres()
        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})
router.post("/Recent",async (req,res,next) => {
    try {
        const movies = await getMoviesAddedSince()
        res.status(200).json(movies)
    } catch (error) {
        next(error)
    }
})

router.get("/recent",async (req,res,next) => {
    try {
        const response = await axios.get(DB_API_URL+"/movies/recent",{headers:{'X-Requested-By': 'backend-server'}})
        const movies = response.data
        // res.status(200).render("pages/movies_recent.ejs",{movies})
        res.status(200).json(response.data)
    } catch (error) {
        next(error)
    }
})

router.get('/create', (req, res,next) => {
    // res.sendFile("/static/create_movie.html",{root:"."})
    // res.status(200).render("pages/create_movie.ejs",{DB_API_URL});
    res.status(200).json({message: "Create movie page not implemented yet. Please use the API directly."})

});


router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for movie with movie_id =",id)
    try {
        const response = await axios.get(DB_API_URL + "/movies/" + id ,{headers:{'X-Requested-By': 'backend-server'}})
        const movie = response.data // either a reosurce obj or err obj
        // if ('error' in movie) throwError (movie.error.message,movie.error.status)
        // res.status(200).render("pages/one_movie.ejs",{movie})
        res.status(200).json(response.data)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;