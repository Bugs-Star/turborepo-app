/* ------------------------------------------------------------
 * File      : /src/controllers/recommendationController.js
 * Brief     : 추천 시스템 관련 컨트롤러
 * Author    : AI Assistant
 * Date      : 2025-10-13
 * Version   : 1.0.0
 * History
 * ------------------------------------------------------------*/

import redisClient from '../config/redis.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

// Redis 설정
const REDIS_STREAM_KEY = "recommendation_tasks_stream";
const REDIS_RESULT_KEY_PREFIX = "reco_result:";
const RECOMMENDATION_TIMEOUT = 10000; // 10초 타임아웃

/**
 * 사용자 개인화 추천 조회
 * GET /api/recommendations
 */
export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString(); // JWT 토큰에서 사용자 ID 추출
    const { limit = 5, includeDetails = true } = req.query;

    console.log(`[Recommendation API] 사용자 '${userId}' 추천 요청`);

    // 1. Redis에서 기존 추천 결과 확인
    const resultKey = `${REDIS_RESULT_KEY_PREFIX}${userId}`;
    const cachedResult = await redisClient.get(resultKey);

    let recommendationIds = [];

    if (cachedResult) {
      // 캐시된 추천 결과 사용
      console.log(`[Recommendation API] 캐시된 추천 결과 사용: ${userId}`);
      recommendationIds = JSON.parse(cachedResult);
    } else {
      // 새로운 추천 요청
      console.log(`[Recommendation API] 새로운 추천 요청 생성: ${userId}`);
      recommendationIds = await requestNewRecommendation(userId);
    }

    // 2. 추천 결과가 없는 경우 폴백 처리
    if (!recommendationIds || recommendationIds.length === 0) {
      console.log(`[Recommendation API] 추천 결과 없음, 폴백 추천 사용: ${userId}`);
      recommendationIds = await getFallbackRecommendations(parseInt(limit));
    }

    // 3. 상품 상세 정보 포함 여부에 따른 응답
    if (includeDetails === 'true') {
      const detailedRecommendations = await getProductDetails(recommendationIds, parseInt(limit));
      return res.json({
        success: true,
        data: {
          userId,
          recommendations: detailedRecommendations,
          type: cachedResult ? 'personalized' : 'fallback',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.json({
        success: true,
        data: {
          userId,
          recommendations: recommendationIds.slice(0, parseInt(limit)),
          type: cachedResult ? 'personalized' : 'fallback',
          timestamp: new Date().toISOString()
        }
      });
    }

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
 * 새로운 추천 요청을 Redis Stream에 전송하고 결과를 기다림
 */
async function requestNewRecommendation(userId) {
  try {
    // Redis Stream에 추천 요청 전송
    const taskId = uuidv4();
    const taskData = {
      userId,
      taskId,
      timestamp: new Date().toISOString()
    };

    await redisClient.xAdd(REDIS_STREAM_KEY, '*', {
      task: JSON.stringify(taskData)
    });

    console.log(`[Recommendation API] 추천 요청 전송 완료: ${userId}, taskId: ${taskId}`);

    // 결과 대기 (폴링 방식)
    const resultKey = `${REDIS_RESULT_KEY_PREFIX}${userId}`;
    const startTime = Date.now();

    while (Date.now() - startTime < RECOMMENDATION_TIMEOUT) {
      const result = await redisClient.get(resultKey);
      if (result) {
        console.log(`[Recommendation API] 추천 결과 수신: ${userId}`);
        return JSON.parse(result);
      }
      // 500ms 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.warn(`[Recommendation API] 추천 요청 타임아웃: ${userId}`);
    return null;

  } catch (error) {
    console.error('[Recommendation API] 추천 요청 오류:', error);
    return null;
  }
}

/**
 * 폴백 추천 (인기 상품 기반)
 */
async function getFallbackRecommendations(limit = 5) {
  try {
    console.log('[Recommendation API] 폴백 추천 생성 중...');
    
    // 추천 상품 우선, 없으면 최신 상품 순으로
    const fallbackProducts = await Product.find({})
      .sort({ 
        isRecommended: -1,  // 추천 상품 우선
        recommendedOrder: 1, // 추천 순서
        createdAt: -1       // 최신 순
      })
      .limit(limit)
      .select('_id productCode');

    return fallbackProducts.map(product => ({
      id: product.productCode,
      score: 1.0 // 폴백의 경우 동일한 점수
    }));

  } catch (error) {
    console.error('[Recommendation API] 폴백 추천 생성 오류:', error);
    return [];
  }
}

/**
 * 추천 상품 ID들에 대한 상세 정보 조회
 */
async function getProductDetails(recommendationIds, limit) {
  try {
    if (!recommendationIds || recommendationIds.length === 0) {
      return [];
    }

    // 추천 ID 목록 추출 (score 정보 포함된 객체 배열인 경우)
    const productCodes = recommendationIds
      .slice(0, limit)
      .map(item => typeof item === 'object' ? item.id : item);

    console.log(`[Recommendation API] 상품 상세 정보 조회: ${productCodes.join(', ')}`);

    // MongoDB에서 상품 정보 조회 (상품 사진과 이름만)
    const products = await Product.find({
      productCode: { $in: productCodes }
    }).select('productCode productName productImg');

    // 추천 순서 유지하면서 상세 정보 매핑
    const detailedRecommendations = [];
    
    for (let i = 0; i < recommendationIds.length && i < limit; i++) {
      const recommendation = recommendationIds[i];
      const productCode = typeof recommendation === 'object' ? recommendation.id : recommendation;
      const score = typeof recommendation === 'object' ? recommendation.score : 1.0;
      
      const product = products.find(p => p.productCode === productCode);
      
      if (product) {
        detailedRecommendations.push({
          productCode: product.productCode,
          productName: product.productName,
          productImg: product.productImg,
          recommendationScore: score,
          recommendationRank: i + 1
        });
      }
    }

    console.log(`[Recommendation API] ${detailedRecommendations.length}개 상품 상세 정보 조회 완료`);
    return detailedRecommendations;

  } catch (error) {
    console.error('[Recommendation API] 상품 상세 정보 조회 오류:', error);
    return [];
  }
}

/**
 * 추천 시스템 상태 확인
 * GET /api/recommendations/health
 */
export const getRecommendationHealth = async (req, res) => {
  try {
    // Redis 연결 상태 확인
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';
    
    // 최근 추천 요청 수 확인 (Stream 길이)
    let streamLength = 0;
    try {
      const streamInfo = await redisClient.xLen(REDIS_STREAM_KEY);
      streamLength = streamInfo;
    } catch (error) {
      console.warn('[Health Check] Stream 정보 조회 실패:', error.message);
    }

    res.json({
      success: true,
      data: {
        status: 'healthy',
        redis: redisStatus,
        streamLength,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Health Check] 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 시스템 상태 확인 실패',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 사용자 추천 캐시 갱신 요청
 * POST /api/recommendations/refresh
 */
export const refreshUserRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // 기존 캐시 삭제
    const resultKey = `${REDIS_RESULT_KEY_PREFIX}${userId}`;
    await redisClient.del(resultKey);
    
    console.log(`[Recommendation API] 사용자 추천 캐시 삭제: ${userId}`);
    
    // 새로운 추천 요청
    const newRecommendations = await requestNewRecommendation(userId);
    
    if (newRecommendations && newRecommendations.length > 0) {
      res.json({
        success: true,
        message: '추천이 성공적으로 갱신되었습니다.',
        data: {
          userId,
          recommendationCount: newRecommendations.length,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.json({
        success: true,
        message: '추천 갱신 요청이 처리되었습니다. 잠시 후 다시 확인해주세요.',
        data: {
          userId,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('[Recommendation API] 추천 갱신 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 갱신 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
