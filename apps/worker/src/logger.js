// logger.js
export function info(...args) {
  console.log("[INFO]", ...args);
}

export function warn(...args) {
  console.warn("[WARN]", ...args);
}

export function error(...args) {
  console.error("[ERROR]", ...args);
}
