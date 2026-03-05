import { Router, Request, Response } from 'express';
const router = Router();

import { verifyAdminJWT, verifyEmployeeJWT } from '../middleware/authMiddleware.js';
import { getUser, getAuthorizedUsers } from '../controllers/users.js';
import { addUserService } from '../controllers/auth.js';
import { body, validationResult } from 'express-validator';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { respondWithJson } from '../utils/responses.js';

router.get("/", verifyAdminJWT, async (req: Request, res: Response) => {
    const users = await getAuthorizedUsers();
    respondWithJson(res, users);
});

router.post(
  '/',
  verifyAdminJWT,
  [
    body('email').notEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('email').custom(value => {
      const domain = value.split('@')[1];
      if (!domain || domain.length < 2) {
        throw new Error('Email domain must be at least 2 characters');
      }
      return true;
    }),

    body('username').notEmpty().withMessage('Username is required'),
    body('username').isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
    body('username').custom(value => !value.includes(' ')).withMessage('Username must not contain spaces'),

    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password').matches(/[a-z]/).withMessage('Password must contain a lowercase letter'),
    body('password').matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
    body('password').matches(/\d/).withMessage('Password must contain a number'),
    body('password').matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),

    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),

    body('role_id').notEmpty().withMessage('Role ID is required'),
    body('role_id').isInt({ min: 1, max: 3 }).withMessage('Role ID must be between 1 and 3 (user, employee, or admin)'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError(errors.array());
    return addUserService(req, res);
  }
);

router.get("/:id", verifyAdminJWT, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    console.log("accesing API for user with user_id =", id);
    const user = await getUser(id);
    if (!user) throw new NotFoundError("User not found");
    respondWithJson(res, user);
});

export default router;
