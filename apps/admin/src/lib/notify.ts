// apps/admin/src/lib/notify.ts
import { toast } from "sonner";

type Opts = NonNullable<Parameters<typeof toast>[1]>;
export type PromiseMsgs<T> = {
  loading: string;
  success: string | ((v: T) => string);
  error: string | ((e: unknown) => string);
};

// Sonner API 최소 타입만 재정의(안전한 래퍼)
type ToastAPI = {
  (message: string, opts?: Opts): unknown;
  success: (message: string, opts?: Opts) => unknown;
  error: (message: string, opts?: Opts) => unknown;
  promise: <T>(
    p: Promise<T>,
    msgs: PromiseMsgs<T>,
    opts?: Opts
  ) => Promise<unknown>;
};

const t = toast as unknown as ToastAPI;

export const notify = {
  info: (msg: string, opts?: Opts) => t(msg, opts),
  success: (msg: string, opts?: Opts) => t.success(msg, opts),
  error: (msg: string, opts?: Opts) => t.error(msg, opts),

  // 버전 상관없이 3번째 인자까지 넘겨도 런타임에서 안전
  promise<T>(p: Promise<T>, msgs: PromiseMsgs<T>, opts?: Opts) {
    return t.promise<T>(p, msgs, opts);
  },
};

export function installAlertShim() {
  if (typeof window !== "undefined") {
    window.alert = (m?: string) => {
      toast(m ?? "");
    };
  }
}
