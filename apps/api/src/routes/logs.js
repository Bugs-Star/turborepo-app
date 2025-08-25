// src/routes/logs.js
import { Router } from 'express';

const router = Router();

// 일반 로그 수신 (배치 처리)
router.post('/batch', (req, res) => {
  try {
    const { logs } = req.body;

    // 받은 로그만 깔끔하게 출력
    if (logs && logs.length > 0) {
      logs.forEach((log, index) => {
        console.log(`[${index + 1}]`, log);
      });
    }

    res.json({
      success: true,
      message: `${logs?.length || 0}개의 배치 로그를 수신했습니다.`,
      received: logs?.length || 0
    });

  } catch (error) {
    console.error('배치 로그 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '배치 로그 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 중요 로그 수신 (즉시 처리)
router.post('/immediate', (req, res) => {
  try {
    const logs = req.body;

    // 받은 로그만 깔끔하게 출력 (중요 로그는 [URGENT] 표시)
    if (logs && logs.length > 0) {
      logs.forEach((log, index) => {
        console.log(`[URGENT ${index + 1}]`, log);
      });
    }

    res.json({
      success: true,
      message: `${logs?.length || 0}개의 중요 로그를 수신했습니다.`,
      received: logs?.length || 0
    });

  } catch (error) {
    console.error('중요 로그 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '중요 로그 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 테스트용 엔드포인트
router.get('/test', (req, res) => {
  res.json({ 
    message: '로그 API가 정상적으로 작동합니다.',
    endpoints: {
      batch: 'POST /logs/batch - 일반 로그 배치 처리',
      immediate: 'POST /logs/immediate - 중요 로그 즉시 처리'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;