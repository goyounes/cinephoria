import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { verifyAdminJWT, verifyEmployeeJWT, verifyUserJWT } from '../controllers/auth.js';
import { getTicketTypes, getMyTickets } from '../controllers/tickets.js';



router.get("/types",async (req,res,next) => {
    try {
        const ticketTypes = await getTicketTypes()
        res.status(200).json(ticketTypes)
    } catch (error) {
        next(error)
    }
})

router.get("/owned", verifyUserJWT,async (req,res,next) => {
    const user = req.user
    try {
        const myTickets = await getMyTickets(user.user_id)
        res.status(200).json(myTickets)
    } catch (error) {
        next(error)
    }
})

export default router;