import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getCart,
  getCartCount,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// 모든 카트 라우트는 인증 필요
router.use(auth);

// 카트 조회
router.get('/', getCart);

// 카트 개수 조회 (하단 네브바용)
router.get('/count', getCartCount);

// 상품 추가
router.post('/add', addToCart);

// 카트 비우기
router.delete('/clear', clearCart);

// 수량 변경 및 상품 제거 (RESTful) - 구체적인 라우트 뒤에 배치
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);

export default router;
