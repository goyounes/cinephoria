import { Router } from 'express';
const router = Router();

import { verifyEmailService, resetPasswordReqService, resetPasswordService, registerService, loginService, logoutService,
  verifyUserJWT , verifyEmployeeJWT , verifyAdminJWT } from '../controllers/auth.js';
router.get('/verify-email', verifyEmailService);
router.post('/reset-password-req', resetPasswordReqService);
router.post('/reset-password', resetPasswordService);

router.post('/register', registerService);
router.post('/login', loginService);
router.post('/logout', logoutService);

router.post('/verify', verifyUserJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
router.post('/verify-user', verifyUserJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
router.post('/verify-employee', verifyEmployeeJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
router.post('/verify-admin', verifyAdminJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;