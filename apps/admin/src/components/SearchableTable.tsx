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
  render: (row: T) => React.ReactNode; // 액션은 반드시 렌더러 필요
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
              // 문자열/숫자/불린만 검색 대상으로
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
    <div className="w-full p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {filters}
      </div>

      {searchPlaceholder && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 w-full mb-4"
        />
      )}

      <table className="w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="border-b border-gray-200 px-3 py-3 text-left text-gray-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="border-b border-gray-200 px-3 py-2"
                >
                  {isDataColumn(col)
                    ? col.render
                      ? col.render(row) // ✅ row만 넘김
                      : String(row[col.key] ?? "")
                    : col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}

export default SearchableTable;
