/* ------------------------------------------------------------
 * File      : /src/routes/auth.js
 * Brief     : 회원가입, 로그인, 로그아웃, 토큰 갱신 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';
import { register, login, refresh, getProfile, updateProfile, logout, deleteAccount } from '../controllers/authController.js';

const router = Router();

// 인증 관련 라우트
router.post('/register', register);                          // 회원가입
router.post('/login', login);                                // 로그인
router.post('/refresh', refresh);                            // 토큰 갱신
router.post('/logout', auth, logout);                        // 로그아웃
router.get('/profile', auth, getProfile);                    // 내 프로필 조회
router.put('/profile', auth, uploadSingle, updateProfile);   // 내 프로필 수정
router.delete('/withdraw', auth, deleteAccount);             // 회원 탈퇴

export default router;
