/**
 * IndexedDB 기반 오프라인 로그 저장소
 *
 * 네트워크 실패 시 로그를 IndexedDB에 저장하고,
 * 네트워크 복구 시 저장된 로그를 전송하는 기능을 제공합니다.
 */

import { NewLogData } from "@repo/types";

interface StoredLog extends NewLogData {
  id?: number;
  status: "pending" | "sent";
  createdAt: string;
}

export class OfflineLogStorage {
  private dbName = "cafe-app-logs";
  private version = 1;
  private db: IDBDatabase | null = null;

  /**
   * IndexedDB 초기화
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB 초기화 실패:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ IndexedDB 초기화 성공");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 로그 저장소 생성
        if (!db.objectStoreNames.contains("logs")) {
          const store = db.createObjectStore("logs", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });

          console.log("✅ 로그 저장소 생성 완료");
        }
      };
    });
  }

  /**
   * 로그 저장
   * @deprecated Use saveLogsBatch instead for better performance
   */
  async saveLog(log: NewLogData): Promise<void> {
    console.warn(
      "saveLog is deprecated. Use saveLogsBatch instead for better performance."
    );
    return this.saveLogsBatch([log]);
  }

  /**
   * 로그 배치 저장 (성능 최적화)
   */
  async saveLogsBatch(logs: NewLogData[]): Promise<void> {
    if (!this.db) await this.init();
    if (logs.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");

      let completed = 0;
      const total = logs.length;

      logs.forEach((log) => {
        const storedLog: StoredLog = {
          ...log,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        const request = store.add(storedLog);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log(`📝 ${total}개 로그 배치 저장 완료`);
            resolve();
          }
        };

        request.onerror = () => {
          console.error("❌ 배치 로그 저장 실패:", request.error);
          reject(request.error);
        };
      });
    });
  }

  /**
   * 전송 대기 중인 로그 조회
   */
  async getPendingLogs(): Promise<NewLogData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readonly");
      const store = transaction.objectStore("logs");
      const index = store.index("status");

      const request = index.getAll("pending");

      request.onsuccess = () => {
        const logs = request.result.map((item: StoredLog) => ({
          event_name: item.event_name,
          event_timestamp: item.event_timestamp,
          user_id: item.user_id,
          session_id: item.session_id,
          device_id: item.device_id,
          platform: item.platform,
          app_version: item.app_version,
          payload: item.payload,
        }));
        console.log(`📊 전송 대기 로그 ${logs.length}개 조회`);
        resolve(logs);
      };

      request.onerror = () => {
        console.error("❌ 로그 조회 실패:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 전송 완료된 로그들 마킹
   */
  async markLogsAsSent(logIds: number[]): Promise<void> {
    if (!this.db) await this.init();
    if (logIds.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");

      let completed = 0;
      const total = logIds.length;

      logIds.forEach((id) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const log = getRequest.result;
          if (log) {
            log.status = "sent";
            const putRequest = store.put(log);
            putRequest.onsuccess = () => {
              completed++;
              if (completed === total) {
                console.log(`✅ ${total}개 로그 전송 완료 마킹`);
                resolve();
              }
            };
            putRequest.onerror = () => reject(putRequest.error);
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  /**
   * 전송 완료된 로그들 배치 마킹 (성능 최적화)
   */
  async markLogsAsSentBatch(logIds: number[]): Promise<void> {
    if (!this.db) await this.init();
    if (logIds.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");

      // 한 번에 모든 로그 조회
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const allLogs = getAllRequest.result as StoredLog[];
        const logsToUpdate = allLogs.filter(
          (log) => log.id && logIds.includes(log.id)
        );

        if (logsToUpdate.length === 0) {
          console.log("⚠️ 마킹할 로그를 찾을 수 없습니다");
          resolve();
          return;
        }

        let completed = 0;
        const total = logsToUpdate.length;

        // 배치로 상태 업데이트
        logsToUpdate.forEach((log) => {
          log.status = "sent";
          const putRequest = store.put(log);

          putRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              console.log(`✅ ${total}개 로그 배치 마킹 완료`);
              resolve();
            }
          };

          putRequest.onerror = () => {
            console.error("❌ 로그 마킹 실패:", putRequest.error);
            reject(putRequest.error);
          };
        });
      };

      getAllRequest.onerror = () => {
        console.error("❌ 로그 조회 실패:", getAllRequest.error);
        reject(getAllRequest.error);
      };
    });
  }

  /**
   * 오래된 로그 정리
   */
  async cleanupOldLogs(daysToKeep: number = 7): Promise<void> {
    if (!this.db) await this.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");
      const index = store.index("createdAt");

      const request = index.openCursor(
        IDBKeyRange.upperBound(cutoffDate.toISOString())
      );
      let deletedCount = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(`🧹 ${deletedCount}개 오래된 로그 정리 완료`);
          }
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 페이로드로 로그 ID 조회
   */
  async getLogIdsByPayloads(logs: NewLogData[]): Promise<number[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readonly");
      const store = transaction.objectStore("logs");
      const request = store.getAll();

      request.onsuccess = () => {
        const allLogs = request.result as StoredLog[];
        const logIds: number[] = [];

        logs.forEach((targetLog) => {
          const foundLog = allLogs.find(
            (storedLog) =>
              storedLog.event_name === targetLog.event_name &&
              storedLog.event_timestamp === targetLog.event_timestamp &&
              storedLog.session_id === targetLog.session_id &&
              storedLog.device_id === targetLog.device_id &&
              storedLog.status === "pending"
          );

          if (foundLog && foundLog.id) {
            logIds.push(foundLog.id);
          }
        });

        resolve(logIds);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 저장소 통계 조회
   */
  async getStats(): Promise<{ total: number; pending: number; sent: number }> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readonly");
      const store = transaction.objectStore("logs");
      const statusIndex = store.index("status");

      const totalRequest = store.count();
      const pendingRequest = statusIndex.count("pending");
      const sentRequest = statusIndex.count("sent");

      let completed = 0;
      const results: { total: number; pending: number; sent: number } = {
        total: 0,
        pending: 0,
        sent: 0,
      };

      const checkComplete = () => {
        completed++;
        if (completed === 3) {
          resolve(results);
        }
      };

      totalRequest.onsuccess = () => {
        results.total = totalRequest.result;
        checkComplete();
      };

      pendingRequest.onsuccess = () => {
        results.pending = pendingRequest.result;
        checkComplete();
      };

      sentRequest.onsuccess = () => {
        results.sent = sentRequest.result;
        checkComplete();
      };

      [totalRequest, pendingRequest, sentRequest].forEach((req) => {
        req.onerror = () => reject(req.error);
      });
    });
  }

  /**
   * 저장소 초기화 (테스트용)
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");

      const request = store.clear();

      request.onsuccess = () => {
        console.log("🗑️ 저장소 초기화 완료");
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}
