/* ------------------------------------------------------------
 * File      : /models/Counter.js
 * Brief     : 시퀀스 카운터 모델 정의
 * Author    : 송용훈
 * Date      : 2025-09-09
 * Version   :
 * History
 * ------------------------------------------------------------*/

import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('Counter', counterSchema);
