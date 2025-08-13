import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profileImg'), updateProfile);
router.post('/logout', auth, logout);

export default router;
