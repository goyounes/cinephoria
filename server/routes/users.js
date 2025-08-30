import { Router } from 'express';
const router = Router();

import { verifyAdminJWT, verifyEmployeeJWT } from '../middleware/authMiddleware.js';
import { getUser, getAuthorizedUsers} from '../controllers/users.js'; // assuming you have a controller to fetch users
import { addUserService } from '../controllers/auth.js'; // assuming you have a controller to add users
import { body, validationResult } from 'express-validator';

router.get("/",verifyAdminJWT,async (req,res,next) => {
    try {
        const users = await getAuthorizedUsers() // this is a controller function that fetches users from the database
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
})

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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return addUserService(req, res, next);
  }
)


router.get("/:id", verifyAdminJWT ,async (req,res,next) => {
    const id = req.params.id
    console.log("accesing API for user with user_id =",id)
    try {
        const user = await getUser(id)
        if (!user) {
            const err = new Error("User not found");
            err.status = 404;
            return next(err);
        }
        res.status(200).json(user)
    } catch (error) {
        next(error) // network request or re-thrown error
    }
})

export default router;