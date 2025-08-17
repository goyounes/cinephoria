import { Router } from 'express';
const router = Router();
import { verifyUserJWT } from '../controllers/auth.js'
import { bookingService, bookingServiceAdmin } from '../controllers/tickets.js';
import { body, validationResult } from 'express-validator';

router.post("/complete", 
  verifyUserJWT,
  [
    body('screening_id')
      .notEmpty().withMessage('Screening ID is required')
      .isInt({ min: 1 }).withMessage('Screening ID must be a positive integer'),
    
    body('ticket_types')
      .notEmpty().withMessage('Ticket types are required')
      .isArray({ min: 1 }).withMessage('Ticket types must be a non-empty array'),
    
    body('ticket_types.*.type_id')
      .notEmpty().withMessage('Ticket type ID is required')
      .isInt({ min: 1 }).withMessage('Ticket type ID must be a positive integer'),
    
    body('ticket_types.*.count')
      .notEmpty().withMessage('Ticket count is required')
      .isInt({ min: 1 }).withMessage('Ticket count must be at least 1'),
    
    body('ticket_types.*.ticket_type_price')
      .notEmpty().withMessage('Ticket price is required')
      .isFloat({ min: 0 }).withMessage('Ticket price must be a positive number'),
    
    body('total_price')
      .notEmpty().withMessage('Total price is required')
      .isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const isEmployee = req.user.role_id >= 2;

    if (isEmployee) {
      bookingServiceAdmin(req, res, next);
    } else {
      bookingService(req, res, next);
    }
  }
);

export default router;
