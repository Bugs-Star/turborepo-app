// apps/admin/src/lib/notify.ts
import { toast } from "sonner";

type Opts = NonNullable<Parameters<typeof toast>[1]>;
type PromiseMsgs<T> = {
  loading: string;
  success: string | ((v: T) => string);
  error: string | ((e: unknown) => string);
};

export const notify = {
  info: (msg: string, opts?: Opts) => toast(msg, opts),
  success: (msg: string, opts?: Opts) => toast.success(msg, opts),
  error: (msg: string, opts?: Opts) => toast.error(msg, opts),

  // ✅ sonner 버전별로 2-인자/3-인자 모두 대응
  promise<T>(p: Promise<T>, msgs: PromiseMsgs<T>, opts?: Opts) {
    const anyToast = toast as any;
    if (
      typeof anyToast.promise === "function" &&
      anyToast.promise.length >= 3
    ) {
      return anyToast.promise(p, msgs, opts);
    }

    return anyToast.promise(p, msgs);
  },
};

export function installAlertShim() {
  if (typeof window !== "undefined") {
    (window as any).alert = (m?: string) => (toast as any)(m ?? "");
  }
}
