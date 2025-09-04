// app/.../ProductList.tsx
"use client";

import { useMemo, useState } from "react";
import SearchableTable from "@/components/SearchableTable";
import EditMenu from "./EditMenu";
import { useGetAllProducts } from "@/hooks/menu/useGetAllProducts";
import { useDeleteMenu } from "@/hooks/menu/useDeleteMenu";

type Category = "beverage" | "food" | "goods";

type Row = {
  id: string;
  image: string;
  name: string;
  code: string;
  price: number;
  category: Category;
  currentStock: number;
  optimalStock: number;
  statusText: string; // 검색에 걸리도록 텍스트로도 보유
  // 편의상 원본도 함께 (수정 모달 초기값 세팅용)
  productContents?: string;
};

const categoryLabel = (c: Category) =>
  c === "beverage" ? "음료" : c === "goods" ? "상품" : "음식";

// EditModal용 UI 카테고리 매핑
const apiToUiCategory = (c: Category) =>
  c === "beverage" ? "drink" : c === "goods" ? "product" : "food";

export default function ProductList() {
  const { data, isLoading, isError, refetch } = useGetAllProducts();

  // 삭제 훅
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu();

  // 카테고리 필터 / 재고 정렬
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [stockSort, setStockSort] = useState<"none" | "asc" | "desc">("none");

  // 수정 모달 상태
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any | null>(null);

  // 테이블에 넣을 행 데이터 생성
  const rows: Row[] = useMemo(() => {
    const list = data?.products ?? [];
    return list.map((p) => {
      const ratio =
        p.optimalStock > 0 ? Math.min(1, p.currentStock / p.optimalStock) : 0;
      const statusText = ratio > 0.7 ? "충분" : ratio > 0.4 ? "보통" : "부족";
      return {
        id: p._id,
        image: p.productImg,
        name: p.productName,
        code: p.productCode,
        price: p.price,
        category: p.category,
        currentStock: p.currentStock ?? 0,
        optimalStock: p.optimalStock ?? 0,
        statusText,
        productContents: p.productContents,
      };
    });
  }, [data]);

  // 카테고리/정렬 적용
  const tableData: Row[] = useMemo(() => {
    let list = rows;
    if (categoryFilter !== "all") {
      list = list.filter((r) => r.category === categoryFilter);
    }
    if (stockSort !== "none") {
      list = [...list].sort((a, b) => {
        const ra =
          a.optimalStock > 0
            ? a.currentStock / a.optimalStock
            : Number.NEGATIVE_INFINITY;
        const rb =
          b.optimalStock > 0
            ? b.currentStock / b.optimalStock
            : Number.NEGATIVE_INFINITY;
        return stockSort === "asc" ? ra - rb : rb - ra;
      });
    }
    return list;
  }, [rows, categoryFilter, stockSort]);

  const handleEdit = (row: Row) => {
    setEditingId(row.id);
    setInitialData({
      productImgUrl: row.image,
      productName: row.name,
      productCode: row.code,
      productContents: row.productContents,
      category: apiToUiCategory(row.category),
      price: row.price,
      currentStock: row.currentStock,
      optimalStock: row.optimalStock,
    });
    setOpen(true);
  };

  const handleDelete = (row: Row) => {
    if (!confirm(`정말 "${row.name}" 메뉴를 삭제할까요?`)) return;
    deleteMenu(row.id, {
      onSuccess: () => {
        // 별도 로컬 상태 없이도 react-query invalidate가 있을 것이므로 보통은 이걸로 충분
        // 필요하면 refetch(); 호출
      },
    });
  };

  // 테이블 필터 UI (상단 오른쪽 영역)
  const filters = (
    <div className="flex items-center gap-2">
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value as any)}
        className="border border-gray-300 rounded-lg px-3 py-1"
      >
        <option value="all">카테고리 필터</option>
        <option value="beverage">음료</option>
        <option value="food">음식</option>
        <option value="goods">상품</option>
      </select>

      <button
        onClick={() =>
          setStockSort((prev) =>
            prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"
          )
        }
        className="inline-flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-50"
        title="재고 비율로 정렬"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="opacity-70"
          aria-hidden
        >
          <path d="M7 10l5-5 5 5H7zm0 4h10l-5 5-5-5z" />
        </svg>
        재고순 정렬
        <span className="text-xs text-gray-500">
          {stockSort === "asc"
            ? "(오름차순)"
            : stockSort === "desc"
              ? "(내림차순)"
              : ""}
        </span>
      </button>
    </div>
  );

  // 컬럼 정의
  const columns = [
    {
      key: "image",
      label: "제품 이미지",
      render: (r: Row) => (
        <img
          src={r.image}
          alt={r.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    },
    { key: "name", label: "제품명" },
    { key: "code", label: "제품코드" },
    {
      key: "price",
      label: "가격",
      render: (r: Row) => `${r.price.toLocaleString("ko-KR")}`,
    },
    {
      key: "category",
      label: "카테고리",
      render: (r: Row) => categoryLabel(r.category),
    },
    {
      key: "currentStock",
      label: "재고 수량",
      render: (r: Row) => {
        const max = Math.max(1, r.optimalStock ?? 0);
        const ratio = Math.min(1, (r.currentStock ?? 0) / max);
        const pct = Math.round(ratio * 100);
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${pct}%`,
                  background:
                    ratio > 0.7
                      ? "#22c55e"
                      : ratio > 0.4
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {r.currentStock ?? 0} / {r.optimalStock ?? 0}개
            </span>
          </div>
        );
      },
    },
    {
      key: "statusText",
      label: "재고 상태",
      render: (r: Row) => {
        const max = Math.max(1, r.optimalStock ?? 0);
        const ratio = Math.min(1, (r.currentStock ?? 0) / max);
        const cls =
          ratio > 0.7
            ? "bg-green-100 text-green-700"
            : ratio > 0.4
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700";
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>
            {r.statusText}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "액션",
      render: (r: Row) => (
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded bg-orange-400 text-white text-sm hover:bg-orange-500 cursor-pointer"
            onClick={() => handleEdit(r)}
          >
            수정
          </button>
          <button
            className="px-2 py-1 rounded bg-[#D74753] text-white text-sm hover:bg-red-500 cursor-pointer"
            onClick={() => handleDelete(r)}
            disabled={isDeleting}
          >
            삭제
          </button>
        </div>
      ),
    },
  ] as const;

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white rounded-2xl shadow-sm text-center text-gray-600">
        불러오는 중…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">모든 제품</h2>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            다시 시도
          </button>
        </div>
        <p className="text-red-600 text-sm">메뉴를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <>
      <SearchableTable<Row>
        title="모든 제품"
        searchPlaceholder="제품명 또는 SKU 검색…"
        filters={filters}
        columns={columns as any}
        data={tableData}
      />

      {open && editingId && (
        <EditMenu
          productId={editingId}
          initialData={initialData ?? undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
