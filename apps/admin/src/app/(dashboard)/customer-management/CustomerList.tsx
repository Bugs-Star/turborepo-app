"use client";

import { useMemo, useState } from "react";
import SearchableTable, { type DataColumn } from "@/components/SearchableTable";

type Row = {
  name: string;
  email: string;
  joined: string;
  recent: string;
};

const CustomerList = () => {
  // 예시 데이터
  const data: Row[] = useMemo(
    () => [
      {
        name: "홍길동",
        email: "hong@example.com",
        joined: "2024-01-02",
        recent: "2025-03-01",
      },
      {
        name: "김아름",
        email: "areum@example.com",
        joined: "2024-04-11",
        recent: "2025-02-20",
      },
    ],
    []
  );

  const columns: DataColumn<Row>[] = [
    { kind: "data", key: "name", label: "이름" },
    { kind: "data", key: "email", label: "이메일" },
    { kind: "data", key: "joined", label: "가입일" },
    { kind: "data", key: "recent", label: "최근 활동" },
  ];

  return (
    <SearchableTable<Row>
      title="고객 목록"
      searchPlaceholder="고객 이름 또는 이메일 검색..."
      columns={columns}
      data={data}
    />
  );
};

export default CustomerList;
