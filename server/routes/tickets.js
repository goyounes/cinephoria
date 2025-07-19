import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { getCheckoutInfo, getCheckoutInfoAdmin } from '../controllers/tickets.js';





router.get("/",async (req,res,next) => {
    try {
        const response = await axios.get("/tickets")
        const tickets = response.data
        // res.status(200).render("pages/tickets.ejs",{tickets})
        res.status(200).json(response.data)
    } catch (error) {
        // next(error)
    }
})

router.get("/checkout/:id", async (req,res,next) => {
    const screening_id = req.params.id
    console.log("checkout : id was hit with id : ", screening_id)
    try {
        const checkoutInfo = await getCheckoutInfo(screening_id)
        res.status(200).json(checkoutInfo)
    } catch (error) {
        next(error)
    }
})
router.get("/all/checkout/:id", async (req,res,next) => {
    const screening_id = req.params.id
    try {
        const checkoutInfo = await getCheckoutInfoAdmin(screening_id)
        res.status(200).json(checkoutInfo)
    } catch (error) {
        next(error)
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