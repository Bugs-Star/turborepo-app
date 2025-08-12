import { Router } from 'express';
import { register, login, getProfile, logout } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);

export default router;
