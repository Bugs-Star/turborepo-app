export function validateLogs(data) {
  const { logs } = data;  // 구조 분해 할당
  
  if (!logs) {
    return { isValid: false, error: 'logs 필드가 없습니다' };
  }
  
  if (!Array.isArray(logs)) {
    return { isValid: false, error: 'logs가 배열이 아닙니다' };
  }
  
  return { isValid: true, count: logs.length };
}
