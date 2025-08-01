import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';
import { getUser, getAuthorizedUsers} from '../controllers/users.js'; // assuming you have a controller to fetch users
import { addUserService } from '../controllers/auth.js'; // assuming you have a controller to add users

router.get("/",verifyAdminJWT,async (req,res,next) => {
    try {
        const users = await getAuthorizedUsers() // this is a controller function that fetches users from the database
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
})

router.post('/', verifyAdminJWT, addUserService)


router.get("/:id", verifyAdminJWT ,async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for user with user_id =",id)
    try {
        const user = await getUser(id) 
        res.status(200).json(user)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;