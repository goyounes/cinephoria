import { Router } from 'express';
const router = Router();

import { verifyEmailService, resetPasswordReqService, resetPasswordService, 
  registerService, loginService, logoutService,
  verifyUserJWT , verifyEmployeeJWT , verifyAdminJWT, 
  refreshService} from '../controllers/auth.js';
import { body, validationResult } from 'express-validator';

// uses refresh token for the route
router.post('/refresh', refreshService);
router.post('/logout', logoutService);


router.get('/verify-email', verifyEmailService);


router.post(
  '/reset-password-req',
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
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return resetPasswordReqService(req, res, next);
  }
);

router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),

    body('newPassword')
      .notEmpty().withMessage('Password is required')
      .bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return resetPasswordService(req, res, next);
  }
);

router.post(
  '/login',
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

    body('password')
      .notEmpty().withMessage('Password is required')
      .bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return loginService(req, res, next);
  }
);

router.post(
  '/register',
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
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return registerService(req, res, next);
  }
);


// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;