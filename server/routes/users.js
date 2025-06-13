import { Router } from 'express';
const router = Router();
import axios from 'axios';

const DB_API_URL = "http://localhost:5000/api/v1"

router.get("/",async (req,res,next) => {
    try {
        const response = await axios.get(DB_API_URL+"/users",{headers:{'X-Requested-By': 'backend-server'}})
        const users = response.data
        // res.status(200).render("pages/users.ejs",{users})
        res.status(200).json(response.data)
    } catch (error) {
        next(error)
    }
})

router.post('/', async(req, res,next) => {
    // res.sendFile("/static/create_user.html",{root:"."})
    // res.status(200).render("pages/create_user.ejs",{DB_API_URL});

    // res.status(200).json({message: "Create user page not implemented yet. Please use the API directly."})
    try {
        const userData = req.body;
        console.log("user data", userData)

        const response = await axios.post(DB_API_URL+"/users", userData, {
            headers: {'Content-Type': 'application/json'},
        });        
        console.log("response of adding user: ",response)
    } catch (error) {
        next(error)
    }

});


router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for user with user_id =",id)
    try {
        const response = await axios.get(DB_API_URL + "/users/" + id ,{headers:{'X-Requested-By': 'backend-server'}})
        const user = response.data  // either a reosurce obj or err obj
        // if ('error' in user) throwError (user.error.message,user.error.status)
        // res.status(200).render("pages/one_user.ejs",{user})
        res.status(200).json(response.data)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;