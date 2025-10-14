/* ------------------------------------------------------------
 * File      : /src/routes/recommendations.js
 * Brief     : 추천 시스템 관련 라우트
 * Author    : AI Assistant
 * Date      : 2025-10-13
 * Version   : 1.0.0
 * History
 * ------------------------------------------------------------*/

import { Router } from 'express';
import { 
  getUserRecommendations, 
  refreshUserRecommendations 
} from '../controllers/recommendationController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

/**
 * 사용자 개인화 추천 조회
 * GET /api/products/recommendations
 * 
 * Query Parameters:
 * - limit: 추천 상품 개수 (기본값: 5)
 * - includeDetails: 상품 상세 정보 포함 여부 (기본값: true)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "userId": "user_id",
 *     "recommendations": [...],
 *     "type": "personalized" | "fallback",
 *     "timestamp": "2025-10-13T..."
 *   }
 * }
 */
router.get('/recommendations', auth, getUserRecommendations);

// Health check 엔드포인트 제거됨

/**
 * 사용자 추천 캐시 갱신 요청
 * POST /api/products/recommendations/refresh
 * 
 * 사용자의 기존 추천 캐시를 삭제하고 새로운 추천을 요청합니다.
 * 구매 패턴이 변경되었거나 즉시 새로운 추천을 받고 싶을 때 사용합니다.
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "추천이 성공적으로 갱신되었습니다.",
 *   "data": {
 *     "userId": "user_id",
 *     "recommendationCount": 5,
 *     "timestamp": "2025-10-13T..."
 *   }
 * }
 */
router.post('/recommendations/refresh', auth, refreshUserRecommendations);

export default router;
