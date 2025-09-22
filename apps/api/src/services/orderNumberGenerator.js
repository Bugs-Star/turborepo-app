/* ------------------------------------------------------------
 * File      : /src/services/orderNumberGenerator.js
 * Brief     : 주문 번호 생성 서비스
 * Author    : 송용훈
 * Date      : 2025-08-14
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import { getNextSequenceValue } from '../utils/sequenceUtil.js';

/**
 * 'YYYYMMDD-XXXXX' 형식의 새로운 주문 번호를 생성합니다.
 * @returns {Promise<string>} 생성된 주문 번호
 */
export const generateOrderNumber = async () => {
  // 1. 오늘 날짜로 'YYYYMMDD' 형식의 문자열 생성
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getDate().toString().padStart(2, '0');

  // 2. 오늘 날짜에 맞는 시퀀스 카운터의 다음 값을 가져옴
  const sequenceName = `order_${dateStr}`;
  const sequence = await getNextSequenceValue(sequenceName);

  // 3. 'YYYYMMDD-XXXXX' 형식으로 조합하여 최종 주문번호 반환
  const orderNumber = `${dateStr}-${sequence.toString().padStart(5, '0')}`;
  
  // console.log(`[ORDER_CREATE] Generated sequence: ${sequence}, Order number: ${orderNumber}`);
  return orderNumber;
};
