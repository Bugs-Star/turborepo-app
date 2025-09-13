"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import type { ProductResponse } from "@/lib/api/products";
import StockAlertModal from "./StockAlertModal";

type Props = {
  /** 전체 상품 리스트(서버 데이터). ProductList에서 넘겨주세요. */
  products: ProductResponse[];
};

const StockAlert = ({ products }: Props) => {
  // 부족 기준: current/optimal <= 0.4
  const lowItems = useMemo(() => {
    const list = products ?? [];
    return list
      .map((p) => {
        const optimal = Math.max(0, p.optimalStock ?? 0);
        const current = Math.max(0, p.currentStock ?? 0);
        const ratio = optimal > 0 ? current / optimal : 0;
        const isLow = p.isLowStock ?? ratio <= 0.4;
        return {
          id: p._id,
          name: p.productName,
          stock: current,
          optimal,
          ratio,
          image: p.productImg,
          isLow,
        };
      })
      .filter((x) => x.isLow)
      .sort((a, b) => a.ratio - b.ratio);
  }, [products]);

  const [open, setOpen] = useState(false);
  if (!lowItems.length) return null;

  const preview = lowItems.slice(0, 3);

  return (
    <>
      <div
        className="
          mt-5 mb-6 rounded-md p-6
          bg-card text-card-foreground border border-border
          relative
        "
        role="status"
        aria-live="polite"
        style={{ borderLeft: "4px solid var(--color-danger)" }}
      >
        {/* 헤더 */}
        <div className="flex flex-col items-start gap-2 mb-3">
          <div className="flex items-center">
            <AlertCircle className="mr-2 text-danger" size={18} />
            <div className="font-semibold">재고 부족 알림</div>
          </div>
          <div className="text-sm text-muted-foreground">
            다음 제품들의 재고가 부족합니다. 빠른 시일 내에 재고를 보충해주세요.
          </div>
        </div>

        {/* 품목 리스트 (최대 3개 미리보기) */}
        <div className="space-y-2 text-sm mt-4">
          {preview.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="truncate pr-4">{item.name}</span>
              <span className="text-danger">현재 재고 : {item.stock}</span>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        {lowItems.length > 3 && (
          <button
            onClick={() => setOpen(true)}
            className="
              mt-5 px-3 py-1 text-sm rounded cursor-pointer transition
              border border-border bg-muted text-card-foreground hover:opacity-90
            "
          >
            모두 보기
          </button>
        )}
      </div>

      <StockAlertModal
        open={open}
        onClose={() => setOpen(false)}
        items={lowItems}
      />
    </>
  );
};

export default StockAlert;
