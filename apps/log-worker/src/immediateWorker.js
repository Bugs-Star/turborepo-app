// src/workers/immediateWorker.js

import Redis from "ioredis";
import axios from "axios";
import 'dotenv/config';

// --- 디버깅용 ---
console.log('--- immediateWorker.js DEBUG ---');
console.log('Current Directory:', process.cwd());
console.log('Loaded SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL);
console.log('------------------------------');

// -- 설정 --
const REDIS_STREAM_KEY = "immediate_logs_stream";
const REDIS_CONSUMER_GROUP = "immediate_alert_group";
const REDIS_CONSUMER_NAME = `immediate_worker_${process.pid}`;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// -- 스트림 최대 길이 --
const STREAM_MAX_LEN = 1000; // 최근 1000건만 유지

// -- Redis 클라이언트 --
const redis = new Redis(process.env.REDIS_URL);

// -- 컨슈머 그룹 생성 --
async function ensureConsumerGroup() {
  try {
    await redis.xgroup("CREATE", REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, "$", "MKSTREAM");
    console.log(`[Redis] Consumer group '${REDIS_CONSUMER_GROUP}' created.`);
  } catch (err) {
    if (err.message.includes("BUSYGROUP")) {
      console.log(`[Redis] Consumer group '${REDIS_CONSUMER_GROUP}' already exists.`);
    } else {
      throw err;
    }
  }
}

// -- Slack 알림 전송 --
async function sendToSlack(log) {
  if (!SLACK_WEBHOOK_URL) return console.warn("SLACK_WEBHOOK_URL 미설정, Slack 전송 불가");

  try {
    const message = {
      text: `🚨 중요 로그 발생: ${log.eventName}`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `🚨 중요 로그 발생: ${log.eventName}` } },
        { type: "section", fields: [
            { type: "mrkdwn", text: `*발생 시간:*\n${new Date(log.eventTimestamp).toLocaleString()}` },
            { type: "mrkdwn", text: `*사용자 ID:*\n${log.userId}` },
          ]
        },
        { type: "section", text: { type: "mrkdwn", text: "*상세 정보:*" } },
        { type: "rich_text", elements: [
            { type: "rich_text_preformatted", elements: [{ type: "text", text: JSON.stringify(log.payload, null, 2) }] }
          ]
        }
      ]
    };

    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log(`[Slack] 알림 전송 성공 (User: ${log.userId})`);
  } catch (error) {
    console.error("[Slack] 전송 실패:", error.response?.data || error.message);
  }
}

// -- 워커 루프 --
async function startWorker() {
  await ensureConsumerGroup();
  console.log(`[Worker] '${REDIS_CONSUMER_NAME}' 시작. 스트림 감시: ${REDIS_STREAM_KEY}`);

  let lastId = ">";

  while (true) {
    try {
      const response = await redis.xreadgroup(
        "GROUP", REDIS_CONSUMER_GROUP, REDIS_CONSUMER_NAME,
        "COUNT", 10,
        "BLOCK", 0,
        "STREAMS", REDIS_STREAM_KEY,
        lastId
      );

      if (response) {
        const messages = response[0][1];
        const idsToAck = [];

        for (const [id, data] of messages) {
          try {
            const log = JSON.parse(data[1]);
            await sendToSlack(log);
            idsToAck.push(id);
          } catch (err) {
            console.error(`메시지 파싱 실패 (ID: ${id}):`, err);
            idsToAck.push(id);
          }
        }

        if (idsToAck.length > 0) {
          // 1️⃣ ACK
          await redis.xack(REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, ...idsToAck);
          
          // 2️⃣ 삭제
          await redis.xdel(REDIS_STREAM_KEY, ...idsToAck);

          // 3️⃣ 스트림 길이 제한
          await redis.xtrim(REDIS_STREAM_KEY, "MAXLEN", STREAM_MAX_LEN);

          console.log(`[Worker] 처리 및 삭제 완료: ${idsToAck.length}건, 스트림 길이 제한 적용`);
        }
      }

    } catch (err) {
      console.error("[Worker] 스트림 읽기 오류:", err);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

startWorker();


// // src/workers/immediateWorker.js

// import Redis from "ioredis";
// import axios from "axios";
// import 'dotenv/config'; // .env 파일 로드를 위해 추가


// // --- 👇 디버깅용 코드 추가 ---
// console.log('--- immediateWorker.js DEBUG ---');
// console.log('Current Directory:', process.cwd());
// console.log('Loaded SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL);
// console.log('------------------------------');
// // --- 여기까지 추가 ---

// // -- 설정 --
// const REDIS_STREAM_KEY = "immediate_logs_stream"; // 감시할 스트림 키
// const REDIS_CONSUMER_GROUP = "immediate_alert_group"; // 이 워커만을 위한 새 컨슈머 그룹
// const REDIS_CONSUMER_NAME = `immediate_worker_${process.pid}`; // 워커 고유 이름

// const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// // -- Redis 클라이언트 및 컨슈머 그룹 설정 --
// const redis = new Redis(process.env.REDIS_URL);

// async function ensureConsumerGroup() {
//   try {
//     await redis.xgroup("CREATE", REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, "$", "MKSTREAM");
//     console.log(`[Redis] Consumer group '${REDIS_CONSUMER_GROUP}' created.`);
//   } catch (err) {
//     if (err.message.includes("BUSYGROUP")) {
//       console.log(`[Redis] Consumer group '${REDIS_CONSUMER_GROUP}' already exists.`);
//     } else {
//       throw err;
//     }
//   }
// }

// // -- Slack 알림 전송 함수 --
// async function sendToSlack(log) {
//   if (!SLACK_WEBHOOK_URL) {
//     console.warn("SLACK_WEBHOOK_URL이 설정되지 않아 Slack 알림을 보낼 수 없습니다.");
//     return;
//   }

//   try {
//     // Slack에 보낼 메시지 형식 커스터마이징
//     const message = {
//       text: `🚨 중요 로그 발생: ${log.eventName}`,
//       blocks: [
//         {
//           type: "header",
//           text: {
//             type: "plain_text",
//             text: `🚨 중요 로그 발생: ${log.eventName}`,
//           },
//         },
//         {
//           type: "section",
//           fields: [
//             { type: "mrkdwn", text: `*발생 시간:*\n${new Date(log.eventTimestamp).toLocaleString()}` },
//             { type: "mrkdwn", text: `*사용자 ID:*\n${log.userId}` },
//           ],
//         },
//         {
//           type: "section",
//           text: {
//             type: "mrkdwn",
//             text: "*상세 정보:*",
//           },
//         },
//         {
//           type: "rich_text",
//           elements: [
//             {
//               type: "rich_text_preformatted",
//               elements: [
//                 {
//                   type: "text",
//                   text: JSON.stringify(log.payload, null, 2),
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     };

//     await axios.post(SLACK_WEBHOOK_URL, message);
//     console.log(`[Slack] 중요 로그 알림을 성공적으로 보냈습니다. (User: ${log.userId})`);

//   } catch (error) {
//     console.error("[Slack] 알림 전송 실패:", error.response ? error.response.data : error.message);
//   }
// }

// // -- 메인 워커 루프 --
// async function startWorker() {
//   await ensureConsumerGroup();
//   console.log(`[Worker] '${REDIS_CONSUMER_NAME}' 시작. ${REDIS_STREAM_KEY} 스트림을 감시합니다.`);
  
//   let lastId = ">"; // 아직 처리되지 않은 새 메시지만 받기

//   while (true) {
//     try {
//       const response = await redis.xreadgroup(
//         "GROUP", REDIS_CONSUMER_GROUP, REDIS_CONSUMER_NAME,
//         "COUNT", 10, // 한 번에 최대 10개씩 처리
//         "BLOCK", 0,  // 메시지 올 때까지 무한 대기
//         "STREAMS", REDIS_STREAM_KEY,
//         lastId
//       );

//       if (response) {
//         const messages = response[0][1];
//         const idsToAck = [];

//         for (const [id, data] of messages) {
//           try {
//             const log = JSON.parse(data[1]);
            
//             // 핵심 처리 로직 호출
//             await sendToSlack(log);

//             idsToAck.push(id);
//           } catch (parseError) {
//             console.error(`메시지 파싱 실패 (ID: ${id}):`, parseError);
//             idsToAck.push(id); // 파싱 실패한 메시지도 ACK 처리하여 무한 루프 방지
//           }
//         }

//         // 처리 완료된 메시지 ACK
//         if (idsToAck.length > 0) {
//           await redis.xack(REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, ...idsToAck);
//         }
//       }
//     } catch (error) {
//       console.error("[Worker] 스트림 읽기 오류:", error);
//       await new Promise((resolve) => setTimeout(resolve, 5000)); // 5초 후 재시도
//     }
//   }
// }

// startWorker();