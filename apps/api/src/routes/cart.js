/* ------------------------------------------------------------
 * File      : /src/routes/cart.js
 * Brief     : 카트 관련 라우트
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getCart, getCartCount, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.use(auth);                             // 모든 카트 라우트는 인증 필요
router.get('/', getCart);                     // 장바구니 조회
router.get('/count', getCartCount);           // 카트 개수 조회 (하단 navbar 용)
router.post('/add', addToCart);               // 장바구니 담기
router.delete('/clear', clearCart);           // 장바구니 비우기
router.put('/:itemId', updateCartItem);       // 장바구니 아이템 수량 변경
router.delete('/:itemId', removeFromCart);    // 장바구니 아이템 제거

export default router;
