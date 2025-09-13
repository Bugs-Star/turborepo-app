"use client";

import React, { useMemo, useState } from "react";

/** ── 컬럼 타입: 데이터 컬럼 vs 액션 컬럼 구분 ── */
export type DataColumn<T extends Record<string, unknown>> = {
  kind: "data";
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type ActionColumn<T extends Record<string, unknown>> = {
  kind: "action";
  key: "actions" | "delete";
  label: string;
  render: (row: T) => React.ReactNode;
};

export type Column<T extends Record<string, unknown>> =
  | DataColumn<T>
  | ActionColumn<T>;

export const isDataColumn = <T extends Record<string, unknown>>(
  col: Column<T>
): col is DataColumn<T> => col.key !== "actions" && col.key !== "delete";

/** ── 컴포넌트 프롭스 ── */
interface SearchableTableProps<T extends Record<string, unknown>> {
  title: string;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
}

function SearchableTable<T extends Record<string, unknown>>({
  title,
  searchPlaceholder,
  filters,
  columns,
  data,
}: SearchableTableProps<T>) {
  const [search, setSearch] = useState("");

  const dataColumns = useMemo(() => columns.filter(isDataColumn), [columns]);
  const q = search.toLowerCase();

  const filteredData = useMemo(
    () =>
      q
        ? data.filter((row) =>
            dataColumns.some((col) => {
              const v = row[col.key];
              return (
                (typeof v === "string" ||
                  typeof v === "number" ||
                  typeof v === "boolean") &&
                String(v).toLowerCase().includes(q)
              );
            })
          )
        : data,
    [data, dataColumns, q]
  );

  return (
    <div className="w-full p-4 bg-card text-card-foreground border border-border rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {filters}
      </div>

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

      <table className="w-full table-auto border-collapse border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-3 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className="hover:bg-muted transition-colors">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-3 py-2 border-b border-border align-top"
                >
                  {isDataColumn(col)
                    ? col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "")
                    : col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}

export default SearchableTable;
