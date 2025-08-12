// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import adminRoutes from './admin.js';

const router = Router();

router.get('/', (req, res) => {
  res.send('Hello from the API!');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;