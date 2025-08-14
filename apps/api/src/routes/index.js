// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import adminRoutes from './admin.js';
import productRoutes from './products.js';
import eventRoutes from './events.js';
import advertisementRoutes from './advertisements.js';

const router = Router();

router.get('/', (req, res) => {
  res.send('Hello from the API!');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/events', eventRoutes);
router.use('/advertisements', advertisementRoutes);

export default router;