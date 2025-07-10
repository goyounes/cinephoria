import { Router } from 'express';
const router = Router();

import { register, login, logout, verifyJWT } from '../controllers/auth.js';
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify', verifyJWT, (req, res) => {
  res.status(200).json({ message: 'Token valid' });
});
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;