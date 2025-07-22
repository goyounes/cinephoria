import { Router } from 'express';
const router = Router();
import { verifyUserJWT } from '../controllers/auth.js'
import { bookingService } from '../controllers/tickets.js';

router.post("/complete", verifyUserJWT, bookingService);

export default router;
