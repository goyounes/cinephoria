import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { verifyAdminJWT, verifyEmployeeJWT } from '../controllers/auth.js';
import { getUser, getUsers} from '../controllers/users.js'; // assuming you have a controller to fetch users
import { addUser } from '../controllers/auth.js'; // assuming you have a controller to add users

router.get("/",verifyEmployeeJWT,async (req,res,next) => {
    try {
        const users = await getUsers() // this is a controller function that fetches users from the database
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
})

// router.post('/', verifyAdminJWT, async(req, res,next) => {
//     try {
//         const userData = req.body;
//         const response = await addUser(userData);        
//         res.status(201).json({ message: "User registered successfully", user_id });
//     } catch (error) {
//         next(error)
//     }
// });

router.post('/', verifyAdminJWT, addUser)


router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for user with user_id =",id)
    try {
        const user = await getUser(id) // this is a controller function that fetches a user from the database
        // if ('error' in user) throwError (user.error.message,user.error.status)
        // res.status(200).render("pages/one_user.ejs",{user})
        res.status(200).json(user)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;