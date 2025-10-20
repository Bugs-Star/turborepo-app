"use client";

import { useMemo, useState, useCallback } from "react";
import SearchableTable, { type DataColumn } from "@/components/SearchableTable";
import { useGetAllCustomers } from "@/hooks/customer/useGetAllCustomers";
import PurchaseHistoryModal from "./PurchaseHistoryModal";

type Row = {
  name: string;
  email: string;
  userId: string;
  joined: string;
  purchase_history: React.ReactNode;
};

const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10) : "-");

export default function CustomerList() {
  // 페이지네이션
  const [page, setPage] = useState(1);
  const limit = 15;

  // 모달 상태
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    email: string;
    userId: string;
  } | null>(null);

  const onOpenModal = useCallback(
    (name: string, email: string, userId: string) => {
      setSelectedUser({ name, email, userId });
      setOpen(true);
    },
    []
  );
  const onCloseModal = useCallback(() => setOpen(false), []);

  // API
  const { data, isLoading, isFetching, isError } = useGetAllCustomers(
    page,
    limit
  );

  // 테이블 컬럼
  const columns: DataColumn<Row>[] = [
    { kind: "data", key: "name", label: "이름" },
    { kind: "data", key: "email", label: "이메일" },
    { kind: "data", key: "joined", label: "가입일" },
    { kind: "data", key: "purchase_history", label: "구매내역" },
  ];

  // rows
  const rows: Row[] = useMemo(() => {
    const users = data?.users ?? [];
    return users.map((u) => ({
      name: u.name,
      email: u.email,
      userId: u.userId,
      joined: fmtDate(u.createdAt),
      purchase_history: (
        <button
          onClick={() => onOpenModal(u.name, u.email, u.userId)}
          className="px-2 py-1 rounded border border-border bg-card hover:opacity-90 text-xs cursor-pointer"
        >
          구매내역 보기
        </button>
      ),
    }));
  }, [data, onOpenModal]);

  const hasPrev = data?.pagination?.hasPrevPage ?? false;
  const hasNext = data?.pagination?.hasNextPage ?? false;
  const current = data?.pagination?.currentPage ?? page;
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-3">
      {isError && (
        <div className="text-sm text-danger">
          고객 데이터를 불러오지 못했습니다.
        </div>
      )}

      <SearchableTable<Row>
        title="고객 목록"
        searchPlaceholder="고객 이름 또는 이메일 검색..."
        columns={columns}
        data={rows}
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {current} / {totalPages} 페이지 {isFetching && "· 업데이트 중…"}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border border-border bg-card disabled:opacity-50 cursor-pointer"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev || isLoading || isFetching}
          >
            이전
          </button>
          <button
            className="px-3 py-1 rounded border border-border bg-card disabled:opacity-50 cursor-pointer"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || isLoading || isFetching}
          >
            다음
          </button>
        </div>
      </div>

      {selectedUser && (
        <PurchaseHistoryModal
          open={open}
          onClose={onCloseModal}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          userId={selectedUser.userId}
        />
      )}
    </div>
  );
}
