// components/StockAlertModal.tsx
"use client";

import { X } from "lucide-react";

export type StockLowItem = {
  id: string;
  name: string;
  stock: number;
  optimal: number;
  ratio: number; // 0~1
  image?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: StockLowItem[];
};

export default function StockAlertModal({ open, onClose, items }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        aria-label="모달 닫기"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* dialog */}
      <div
        className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 
        bg-card text-card-foreground border border-border rounded-xl shadow-lg"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold">재고 부족 목록 ({items.length})</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted cursor-pointer"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="max-h-[70vh] overflow-auto p-5">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left px-3 py-2">제품명</th>
                <th className="text-right px-3 py-2">현재 / 적정</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const pct = Math.round(Math.min(1, it.ratio) * 100);
                return (
                  <tr key={it.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                        <span className="truncate">{it.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {it.stock} / {it.optimal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* footer */}
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
