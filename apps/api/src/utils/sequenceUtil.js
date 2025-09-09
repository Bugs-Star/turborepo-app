/* ------------------------------------------------------------
 * File      : /utils/sequenceUtil.js
 * Brief     : 원자적으로 시퀀스 값을 1 증가시키고 그 값을 반환
 * Author    : 송용훈
 * Date      : 2025-09-09
 * Version   :
 * History
 * ------------------------------------------------------------*/

import Counter from '../models/Counter.js';

export async function getNextSequenceValue(sequenceName, session) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true, session: session }
  );
  return counter.sequence_value;
}
