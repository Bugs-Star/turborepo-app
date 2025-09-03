"use client";

import React, { useState } from "react";

interface Column<T> {
  key: keyof T | "actions" | "delete";
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface SearchableTableProps<T> {
  title: string;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
}

function SearchableTable<T extends { [key: string]: any }>({
  title,
  searchPlaceholder,
  filters,
  columns,
  data,
}: SearchableTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key]).toLowerCase().includes(search.toLowerCase())
    )
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
                  {col.render ? col.render(row) : row[col.key]}
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
