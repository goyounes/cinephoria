import { Router } from 'express';
const router = Router();
import axios from 'axios';
import { verifyAdminJWT, verifyEmployeeJWT, verifyUserJWT } from '../middleware/authMiddleware.js';
import { getTicketTypes, getMyTickets } from '../controllers/tickets.js';

// Cache middleware imports
import { 
    tryCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';



router.get("/types",
    tryCache('cache:ticket_types', CACHE_TTL.STATIC_DATA),
    async (req,res,next) => {
    try {
        const ticketTypes = await getTicketTypes()
        res.status(200).json(ticketTypes)
        saveToCache(req, ticketTypes);
    } catch (error) {
        next(error)
    }
})

router.get("/owned", verifyUserJWT,
    async (req,res,next) => {
    const user = req.user
    try {
        const myTickets = await getMyTickets(user.user_id)
        res.status(200).json(myTickets)
    } catch (error) {
        next(error)
    }
})

export default router;