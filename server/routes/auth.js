import { Router } from 'express';
const router = Router();

import { register, login, logout, verifyUserJWT } from '../controllers/auth.js';
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify', verifyUserJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;