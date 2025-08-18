import SearchableTable from "@/components/SearchableTable";

interface Product {
  image: string;
  name: string;
  code: string;
  price: number;
  category: string;
  stock: string;
  status: React.ReactNode;
  action: React.ReactNode;
}

const products: Product[] = [
  {
    image: "☕",
    name: "유기농 커피 원두 1kg",
    code: "HOT_AMERICANO",
    price: 4500,
    category: "음료",
    stock: "85 / 100개",
    status: <span className="text-green-600 font-bold">충분</span>,
    action: (
      <button className="bg-[#D74753] text-white px-3 py-1 rounded cursor-pointer">
        메뉴 삭제
      </button>
    ),
  },
  {
    image: "🍵",
    name: "프리미엄 녹차 티백 (20개)",
    code: "HOT_GREENTEA",
    price: 5500,
    category: "차",
    stock: "12 / 50개",
    status: <span className="text-yellow-600 font-bold">부족</span>,
    action: (
      <button className="bg-[#D74753] text-white px-3 py-1 rounded cursor-pointer">
        메뉴 삭제
      </button>
    ),
  },
];

const ProductList = () => {
  return (
    <SearchableTable
      title="모든 제품"
      searchPlaceholder="제품명 또는 SKU 검색..."
      filters={
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
            <option>카테고리별 필터</option>
            <option>음료</option>
            <option>상품</option>
          </select>
          <button className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
            재고순 정렬
          </button>
        </div>
      }
      columns={[
        { key: "image", label: "제품 이미지" },
        { key: "name", label: "제품명" },
        { key: "code", label: "제품코드" },
        { key: "price", label: "가격" },
        { key: "category", label: "카테고리" },
        { key: "stock", label: "재고 수량" },
        { key: "status", label: "재고 상태" },
        { key: "action", label: "작업" },
      ]}
      data={products}
    />
  );
};
export default ProductList;
