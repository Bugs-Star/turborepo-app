import { Router } from 'express';
import { register, login, refresh, getProfile, updateProfile, logout, deleteAccount } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = Router();

// 인증 관련 라우트
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);                    // 토큰 갱신
router.get('/profile', auth, getProfile);
router.put('/profile', auth, uploadSingle, updateProfile);
router.post('/logout', auth, logout);
router.delete('/withdraw', auth, deleteAccount);

export default router;
