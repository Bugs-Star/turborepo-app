import schedule from 'node-schedule';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * 터미널 명령어를 실행하는 헬퍼 함수
 * @param {string} command - 실행할 명령어
 */
async function runCommand(command) {
  console.log(`[Scheduler] Executing: ${command}`);
  try {
    // 'cwd' 옵션을 주어 스크립트 파일이 있는 'src' 폴더 기준으로 명령을 실행합니다.
    const { stdout, stderr } = await execPromise(command, { cwd: './src' });
    if (stdout) console.log(`[stdout]\n${stdout}`);
    if (stderr) console.error(`[stderr]\n${stderr}`);
    console.log(`[Scheduler] Finished: ${command}`);
  } catch (error) {
    console.error(`[Scheduler] Command failed: ${command}`, error);
    throw error; // 파이프라인 중단을 위해 에러를 던집니다.
  }
}

/**
 * 전체 배치 파이프라인을 순서대로 실행하는 메인 함수
 */
async function runBatchPipeline() {
  console.log('--- 추천 시스템 배치 작업을 시작합니다 ---');
  try {
    // 1단계: Node.js로 데이터 전처리
    await runCommand('node 1_preprocess.js');

    // 2단계: 아이템 벡터 생성
    await runCommand('node 2_embed.js');

    // 3단계: 생성된 벡터를 Milvus에 업데이트
    await runCommand('node 3_updateMilvus.js');

    // 4단계: 사용자 취향 벡터 생성
    await runCommand('node 4_createUserVectors.js');
    
    console.log('--- 추천 시스템 배치 작업을 성공적으로 완료했습니다 ---');
  } catch (error) {
    console.error('--- 추천 시스템 배치 작업이 실패했습니다 ---', error);
  }
}

/**
 * 스케줄러를 시작하는 함수
 */
async function startScheduler() {
    console.log('✅ 배치 스케줄러 워커가 시작됩니다...');

    // <<< 이 부분이 핵심 변경 사항입니다 >>>
    // 1. 서버 시작 시 즉시 배치 파이프라인을 1회 실행합니다.
    console.log('🚀 서버 시작과 함께 최초 배치 작업을 실행합니다...');
    await runBatchPipeline();

    // 2. 최초 실행이 끝난 후, 매일 새벽 3시에 실행되도록 스케줄을 등록합니다.
    console.log('⏰ 매일 새벽 3시에 실행되도록 작업을 스케줄합니다.');
    schedule.scheduleJob('0 3 * * *', runBatchPipeline);

    console.log('✅ 배치 스케줄러가 실행 중입니다. 다음 스케줄을 기다립니다...');
}

// 스케줄러 시작
startScheduler();

