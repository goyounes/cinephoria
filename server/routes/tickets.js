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





router.get("/",verifyEmployeeJWT,async (req,res,next) => {
    try {
        const response = await axios.get("/tickets")
        const tickets = response.data
        // res.status(200).render("pages/tickets.ejs",{tickets})
        res.status(200).json(response.data)
    } catch (error) {
        // next(error)
    }
})

router.get("/:id",async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for ticket with ticket_id =",id)
    try {
        const response = await axios.get(DB_API_URL+ "/tickets/" + id,{headers:{'X-Requested-By': 'backend-server'}})
        const tickets = response.data
        // if ('error' in tickets) throwError (tickets.error.message,tickets.error.status)
        // res.status(200).render("pages/tickets.ejs",{tickets})
        res.status(200).json(response.data)
    } catch (error) {
        next(error)
    }
})

export default router;