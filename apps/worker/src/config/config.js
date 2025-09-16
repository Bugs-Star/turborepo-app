// config.js
// 이 파일은 Redis와 ClickHouse 관련 설정값들을 모아놓은 모듈입니다.
// 주로 워커(worker) 서버에서 Redis 스트림을 읽고, ClickHouse에 데이터를 저장할 때 사용합니다.
import dotenv from "dotenv";
dotenv.config(); // .env 파일 읽어서 process.env에 반영

// REDIS_STREAM_KEY: Redis 스트림의 이름입니다.
// Redis 스트림은 메시지 큐 같은 역할을 하며, 이 이름으로 이벤트들이 쌓입니다.
// export const REDIS_STREAM_KEY = "event_stream";
export const REDIS_STREAM_KEY = "batch_logs_stream";

// REDIS_CONSUMER_GROUP: Redis 스트림을 소비하는 소비자 그룹 이름입니다.
// 소비자 그룹은 여러 워커가 협력하여 스트림 메시지를 분산 처리할 수 있게 해줍니다.
// 그룹 내 각 소비자는 메시지 중복 없이 처리할 수 있도록 관리됩니다.
export const REDIS_CONSUMER_GROUP = "worker_group";

// REDIS_CONSUMER_NAME: 이 워커 인스턴스의 고유 이름입니다.
// 워커 여러 대가 동시에 실행될 때 각각 구분하기 위해 랜덤한 6자리 문자열을 붙여 만듭니다.
// toString(36)은 0~9, a~z까지 포함하는 36진법 문자열 변환입니다.
// substring(2,8)은 0.abcdef 같은 문자열 중 앞 '0.'를 제외한 6글자를 취합니다.
export const REDIS_CONSUMER_NAME = `worker_${Math.random()
  .toString(36)
  .substring(2, 8)}`;

// CLICKHOUSE_CONFIG: ClickHouse 데이터베이스 접속 설정 객체입니다.
// url: ClickHouse 서버가 로컬호스트의 8123 포트에서 HTTP 인터페이스로 동작 중임을 나타냅니다.
// basicAuth: 기본 인증 정보(아이디: default, 비밀번호는 빈 문자열).
// debug: 디버그 모드 여부 (false면 로그 출력 최소화).
export const CLICKHOUSE_CONFIG = {
  // url: "http://default:1234@localhost:8123", // HTTP URL 형식
  // debug: true,
  url: `https://${process.env.CLICKHOUSE_USERNAME}:${process.env.CLICKHOUSE_PASSWORD}@${process.env.CLICKHOUSE_HOST.replace('https://', '')}`,
  debug: false,
};

// 개념 정리
// Redis 스트림
// Redis는 키-값 저장소지만, 스트림 기능은 메시지 큐 역할을 합니다.
// XADD 명령으로 이벤트를 추가하고, XREADGROUP으로 소비자 그룹이 메시지를 읽습니다.
// 스트림은 순차적으로 쌓이는 이벤트 로그이며, 여러 소비자가 협력해 처리할 수 있습니다.

// 소비자 그룹(Consumer Group)
// Redis 스트림을 여러 워커가 나눠서 읽도록 하는 그룹 단위입니다.
// 그룹 내 각 소비자는 자신이 처리할 메시지를 할당받으며, 중복 처리를 방지합니다.

// ClickHouse
// ClickHouse는 대용량 데이터 분석에 최적화된 컬럼형 데이터베이스입니다.
// 빠른 집계와 복잡한 쿼리를 지원해 로그 분석, 실시간 이벤트 처리 등에 주로 사용됩니다.

// Math.random().toString(36).substring(2, 8)
// 랜덤한 6자리 영문+숫자 문자열을 만듭니다.
// 이는 워커 인스턴스 구분용 임시 아이디로 쓰입니다.
