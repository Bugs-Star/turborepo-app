"use client";

import React, { useMemo, useState } from "react";

/** ── 공통 옵션 ── */
type Align = "left" | "center" | "right";
type BaseCol<T extends Record<string, unknown>> = {
  label: string;
  /** 셀 정렬 */
  align?: Align;
  /** 헤더 정렬 (기본: align) */
  headerAlign?: Align;
  /** 고정 너비(px, %, rem 등) */
  width?: string | number;
  /** td 클래스 */
  className?: string;
  /** th 클래스 */
  headerClassName?: string;
};

/** ── 컬럼 타입: 데이터/액션 ── */
export type DataColumn<T extends Record<string, unknown>> = BaseCol<T> & {
  kind: "data";
  key: keyof T;
  /**
   * 셀 커스텀 렌더러.
   * (value, row) 형태로 받도록 해두면 유연성이 좋아집니다.
   */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** 검색에 사용할 값을 반환 (없으면 기본 row[key] 사용) */
  getSearchValue?: (row: T) => string;
};

export type ActionColumn<T extends Record<string, unknown>> = BaseCol<T> & {
  kind: "action";
  /** 구분용 키 (표시는 안 쓰임) */
  key: "actions" | "delete" | string;
  render: (row: T) => React.ReactNode;
};

export type Column<T extends Record<string, unknown>> =
  | DataColumn<T>
  | ActionColumn<T>;

export const isDataColumn = <T extends Record<string, unknown>>(
  col: Column<T>
): col is DataColumn<T> => col.kind === "data";

/** ── 컴포넌트 프롭스 ── */
interface SearchableTableProps<T extends Record<string, unknown>> {
  title: string;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  /** 로딩 스켈레톤 표시 */
  isLoading?: boolean;
  /** 빈 상태 문구 */
  emptyText?: string;
  /** 키 함수 (안 주면 index 사용) */
  getRowKey?: (row: T, index: number) => React.Key;
}

/** ── 내부: 값 → 렌더 가능한 형태로 ── */
function renderPrimitive(value: unknown): React.ReactNode {
  if (React.isValidElement(value)) return value;
  if (value === null || value === undefined) return "—";
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") {
    return String(value);
  }
  // 객체/배열 등 안전 처리
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function alignClass(a?: Align) {
  switch (a) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

function SearchableTable<T extends Record<string, unknown>>({
  title,
  searchPlaceholder,
  filters,
  columns,
  data,
  isLoading = false,
  emptyText = "검색 결과가 없습니다.",
  getRowKey,
}: SearchableTableProps<T>) {
  const [search, setSearch] = useState("");

  const dataColumns = useMemo(() => columns.filter(isDataColumn), [columns]);

  const q = search.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!q) return data;

    return data.filter((row) =>
      dataColumns.some((col) => {
        // 검색 값 우선순위: getSearchValue → row[col.key]
        const needle =
          col.getSearchValue?.(row) ??
          (row[col.key] as unknown as string | number | boolean | undefined);

        if (needle === null || needle === undefined) return false;
        if (typeof needle === "string") return needle.toLowerCase().includes(q);
        return String(needle).toLowerCase().includes(q);
      })
    );
  }, [data, dataColumns, q]);

  return (
    <div className="w-full p-4 bg-card text-card-foreground border border-border rounded-2xl shadow-sm mt-10">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {filters}
      </div>

      {/* 검색 인풋 */}
      {searchPlaceholder && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full mb-4 px-3 py-2 rounded-lg
            bg-background text-foreground placeholder:text-muted-foreground
            border border-border
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border)]
          "
        />
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-muted">
              {columns.map((col, i) => {
                const headerAlign = col.headerAlign ?? col.align;
                return (
                  <th
                    key={`${String(col.key)}-${i}`}
                    className={`
                      px-3 py-3 text-sm font-medium text-muted-foreground border-b border-border
                      ${alignClass(headerAlign)}
                      ${col.headerClassName ?? ""}
                    `}
                    style={{
                      width:
                        col.width !== undefined
                          ? typeof col.width === "number"
                            ? `${col.width}px`
                            : col.width
                          : undefined,
                    }}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* 로딩 스켈레톤 */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={`skeleton-${r}`} className="border-b border-border">
                  {columns.map((col, c) => (
                    <td key={`skeleton-${r}-${c}`} className="px-3 py-2">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              filteredData.map((row, rowIdx) => {
                const rowKey =
                  getRowKey?.(row, rowIdx) ?? `${rowIdx}-${Math.random()}`;

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-muted transition-colors border-b border-border"
                  >
                    {columns.map((col, colIdx) => {
                      const tdAlign = col.align;
                      const tdClass = `
                        px-3 py-2 align-top ${alignClass(tdAlign)}
                        ${col.className ?? ""}
                      `;

                      if (isDataColumn(col)) {
                        const value = row[col.key] as unknown;
                        return (
                          <td key={`${rowKey}-${colIdx}`} className={tdClass}>
                            {col.render
                              ? col.render(
                                  value as T[keyof T],
                                  row // value + row 둘 다 넘김
                                )
                              : renderPrimitive(value)}
                          </td>
                        );
                      }

                      // 액션 컬럼
                      return (
                        <td key={`${rowKey}-${colIdx}`} className={tdClass}>
                          {col.render(row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredData.length === 0 && (
        <div className="py-4 text-center text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  );
}

export default SearchableTable;
