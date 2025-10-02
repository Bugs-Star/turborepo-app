"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClassName?: string; // e.g. "w-[min(760px,92vw)]"
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "w-[min(720px,92vw)]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="모달 닫기"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={`absolute left-1/2 top-1/2 ${widthClassName} -translate-x-1/2 -translate-y-1/2 
        bg-card text-card-foreground border border-border rounded-xl shadow-lg`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted cursor-pointer"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">{children}</div>

        <div className="px-5 py-3 border-t border-border text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-border bg-muted hover:opacity-90 text-sm cursor-pointer text-card-foreground"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
