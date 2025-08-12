import { Router } from 'express';
import { adminLogin, adminLogout, getAdminProfile } from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const router = Router();

router.post('/login', adminLogin);
router.post('/logout', adminAuth, adminLogout);
router.get('/profile', adminAuth, getAdminProfile);

export default router;
