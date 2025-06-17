import { Router } from 'express';
const router = Router();
import axios from 'axios';


import { register, login, logout } from '../controllers/auth.js';
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
 
// router.delete('/user/:id', (req, res) => {
//   res.send(`Deleted user ${req.params.id}`);
// });

export default router;