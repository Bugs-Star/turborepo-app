/* ------------------------------------------------------------
 * File      : /src/services/reportQueryValidator.js
 * Brief     : 보고서 쿼리 검증 서비스
 * Author    : 송용훈
 * Date      : 2025-09-22
 * Version   : 
 * History
 * ------------------------------------------------------------*/

/**
 * 보고서 요청 검증
 * @param {Object} params - req.params 객체
 * @param {Object} query - req.query 객체
 * @returns {Object} - { isValid: boolean, error?: string, validatedData?: Object }
 */
export const validateReportRequest = (params, query) => {
  const { periodType } = params;
  const { year, month, week } = query;
  
  // periodType 검증
  if (!['yearly', 'monthly', 'weekly'].includes(periodType)) {
    return {
      isValid: false,
      error: '잘못된 periodType 입니다. [yearly, monthly, weekly] 중 하나여야 됩니다.'
    };
  }
  
  // weekly의 경우 필수 파라미터 체크
  if (periodType === 'weekly' && (!year || !month || !week)) {
    return {
      isValid: false,
      error: 'year, month, week 쿼리 파라미터는 weekly 리포트에 필수입니다.'
    };
  }
  
  return {
    isValid: true,
    validatedData: {
      periodType,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      week: week ? parseInt(week) : undefined
    }
  };
};
