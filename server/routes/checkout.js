import { Router } from 'express';
const router = Router();
import { verifyUserJWT } from '../controllers/auth.js'
import { bookingService, bookingServiceAdmin } from '../controllers/tickets.js';

router.post("/complete", verifyUserJWT, (req, res, next) => {
  const isEmployee = req.user.role_id >= 2;

  if (isEmployee) {
    bookingServiceAdmin(req, res, next);
  } else {
    bookingService(req, res, next);
  }
});

export default router;
