"use client";
import { ReactNode, useState } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode; // 커스텀 렌더링
}

interface SearchableTableProps<T> {
  title?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  columns: Column<T>[];
  data: T[];
}

const SearchableTable = <T,>({
  title,
  searchPlaceholder = "검색...",
  filters,
  columns,
  data,
}: SearchableTableProps<T>) => {
  const [query, setQuery] = useState("");

  const filteredData = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* 제목 */}
      {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}

      {/* 검색 & 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        {filters && <div>{filters}</div>}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-2 font-medium text-gray-600"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2">
                    {col.render
                      ? col.render(row)
                      : (row[col.key as keyof T] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchableTable;
