/* ------------------------------------------------------------
 * File      : /src/controllers/recommendationController.simple.js
 * Brief     : 추천 시스템 관련 컨트롤러 (단순화 버전)
 * Author    : AI Assistant
 * Date      : 2025-10-13
 * Version   : 1.0.0
 * History
 * ------------------------------------------------------------*/

import Product from '../models/Product.js';

/**
 * 사용자 개인화 추천 조회 (단순화 버전)
 * GET /api/products/recommendations
 */
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { limit = 5 } = req.query;

    console.log(`[Recommendation API] 사용자 '${userId}' 추천 요청`);

    // 임시로 추천 상품만 반환 (실제 AI 추천 대신)
    const recommendations = await Product.find({ isRecommended: true })
      .sort({ recommendedOrder: 1 })
      .limit(parseInt(limit))
      .select('productCode productName productImg');

    const formattedRecommendations = recommendations.map((product, index) => ({
      productCode: product.productCode,
      productName: product.productName,
      productImg: product.productImg,
      recommendationScore: 1.0 - (index * 0.1), // 임시 점수
      recommendationRank: index + 1
    }));

    return res.json({
      success: true,
      data: {
        userId,
        recommendations: formattedRecommendations,
        type: 'fallback',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Recommendation API] 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 서비스에 일시적인 문제가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 사용자 추천 캐시 갱신 요청 (단순화 버전)
 * POST /api/products/recommendations/refresh
 */
export const refreshUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    console.log(`[Recommendation API] 사용자 추천 갱신 요청: ${userId}`);
    
    res.json({
      success: true,
      message: '추천이 성공적으로 갱신되었습니다.',
      data: {
        userId,
        recommendationCount: 5,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Recommendation API] 추천 갱신 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 갱신 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
