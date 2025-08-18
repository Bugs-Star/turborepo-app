"use client";
import SearchableTable from "@/components/SearchableTable";

interface Customer {
  name: string;
  email: string;
  joined: string;
  recent: string;
}

const customers: Customer[] = [
  {
    name: "김지연",
    email: "jiyeon.kim@example.com",
    joined: "2023-01-15",
    recent: "최근 구매: 에스프레소",
  },
  {
    name: "이서준",
    email: "seojun.lee@example.com",
    joined: "2023-03-10",
    recent: "신규 주문 생성",
  },
];

const CustomerList = () => {
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
          key: "action",
          label: "작업",
          render: (row) => (
            <button className="bg-[#005C14] text-white px-3 py-1 rounded cursor-pointer">
              구매 내역 보기
            </button>
          ),
        },
      ]}
      data={customers}
    />
  );
};

export default CustomerList;
