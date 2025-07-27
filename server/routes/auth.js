import { Router } from 'express';
const router = Router();

import { verifyEmailService, resetPasswordReqService, resetPasswordService, registerService, loginService, logoutService,
  verifyUserJWT , verifyEmployeeJWT , verifyAdminJWT } from '../controllers/auth.js';
import { body, validationResult } from 'express-validator';

router.post('/verify-user', verifyUserJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
router.post('/verify-employee', verifyEmployeeJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
router.post('/verify-admin', verifyAdminJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});

router.get('/verify-email', verifyEmailService);
router.post('/reset-password-req', resetPasswordReqService);
router.post('/reset-password', resetPasswordService);

router.post('/logout', logoutService);

router.post(
  '/login',
  [
    // Validate username or email (assuming login accepts either)
    body('username')
      .notEmpty().withMessage('Username is required')
      .bail()
      .isLength({ min: 4 }).withMessage('Username must be at least 4 characters')
      .bail()
      .custom(value => !value.includes(' ')).withMessage('Username must not contain spaces'),

    // Password validations separated
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
    // Email validations
    body('email').notEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('email').custom(value => {
      const domain = value.split('@')[1];
      if (!domain || domain.length < 2) {
        throw new Error('Email domain must be at least 2 characters');
      }
      return true;
    }),

    // Username validations
    body('username').notEmpty().withMessage('Username is required'),
    body('username').isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
    body('username').custom(value => !value.includes(' ')).withMessage('Username must not contain spaces'),

    // Password validations
    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password').matches(/[a-z]/).withMessage('Password must contain a lowercase letter'),
    body('password').matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
    body('password').matches(/\d/).withMessage('Password must contain a number'),
    body('password').matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),

    // First and last name
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