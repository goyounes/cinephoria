import { Router, Request, Response } from 'express';
const router = Router();
import { verifyUserJWT } from '../middleware/authMiddleware.js';
import { getTicketTypes, getMyTickets } from '../controllers/tickets.js';

// Cache middleware imports
import {
    tryCache,
    saveToCache
} from '../middleware/cacheMiddleware.js';
import { CACHE_TTL } from '../middleware/cacheUtils.js';
import { respondWithJson } from '../utils/responses.js';

router.get("/types",
    tryCache('cache:ticket_types', CACHE_TTL.STATIC_DATA),
    async (req: Request, res: Response) => {
        const ticketTypes = await getTicketTypes();
        respondWithJson(res, ticketTypes);
        saveToCache(req, ticketTypes);
    });

router.get("/owned", verifyUserJWT,
    async (req: Request, res: Response) => {
        const user = req.user!;
        const myTickets = await getMyTickets(user.user_id);
        respondWithJson(res, myTickets);
    });

export default router;
