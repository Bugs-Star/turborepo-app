"use client";
import SearchableTable from "@/components/SearchableTable";
import { useGetAllCustomers } from "@/hooks/useGetAllCustomers";

const CustomerList = () => {
  const { data, isLoading, isError } = useGetAllCustomers(1, 15);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching customer data</p>;

  const customers = data?.users.map((user) => ({
    name: user.name,
    email: user.email,
    joined: new Date(user.createdAt).toLocaleDateString("ko-KR"),
    recent: "-", // 최근 활동 API 없으니 placeholder
  }));

  return (
    <SearchableTable
      title="고객 목록"
      searchPlaceholder="고객 이름 또는 이메일 검색..."
      columns={[
        { key: "name", label: "이름" },
        { key: "email", label: "이메일" },
        { key: "joined", label: "가입일" },
        { key: "recent", label: "최근 활동" },
        {
          key: "name",
          label: "작업",
          render: (row) => (
            <button className="bg-[#005C14] text-white px-3 py-1 rounded cursor-pointer">
              구매 내역 보기
            </button>
          ),
        },
      ]}
      data={customers || []}
    />
  );
};

export default CustomerList;
