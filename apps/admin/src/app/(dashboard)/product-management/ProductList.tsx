"use client";

import { useGetAllProducts } from "@/hooks/useGetAllProducts";
import SearchableTable from "@/components/SearchableTable";
import { useState } from "react";
import EditMenu from "./EditMenu";

interface Product {
  id: string;
  image: string;
  name: string;
  code: string;
  price: number;
  category: "beverage" | "food" | "goods";
  stock: string;
  isLowStock: boolean;
}

const ProductList = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, isError } = useGetAllProducts({
    category: categoryFilter as "beverage" | "food" | "goods",
    page: 1,
    limit: 100,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>데이터를 가져오는데 실패했습니다.</div>;

  // 순수 JSON 데이터만 전달
  const products =
    data?.products.map((product) => ({
      id: product._id,
      image: product.productImg || "☕",
      name: product.productName,
      code: product.productCode,
      price: product.price,
      category: product.category,
      stock: `${product.currentStock} / ${product.optimalStock}개`,
      isLowStock: product.isLowStock,
    })) || [];

  const openEditMenuModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeEditMenuModal = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      <SearchableTable
        title="모든 제품"
        searchPlaceholder="제품명 또는 SKU 검색..."
        filters={
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "전체" ? undefined : e.target.value
                )
              }
            >
              <option>전체</option>
              <option value="beverage">음료</option>
              <option value="food">음식</option>
              <option value="goods">상품</option>
            </select>
            <button className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              재고순 정렬
            </button>
          </div>
        }
        columns={[
          {
            key: "image",
            label: "제품 이미지",
            render: (row) => (
              <img
                src={row.image}
                alt={row.name}
                className="w-12 h-12 object-cover rounded"
              />
            ),
          },
          { key: "name", label: "제품명" },
          { key: "code", label: "제품코드" },
          { key: "price", label: "가격" },
          { key: "category", label: "카테고리" },
          { key: "stock", label: "재고 수량" },
          {
            key: "isLowStock",
            label: "재고 상태",
            render: (row) =>
              row.isLowStock ? (
                <span className="text-yellow-600 font-bold">부족</span>
              ) : (
                <span className="text-green-600 font-bold">충분</span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <button
                onClick={() => openEditMenuModal(row)}
                className="bg-orange-400 text-sm text-white px-3 py-1 rounded-xl cursor-pointer"
              >
                수정
              </button>
            ),
          },
          {
            key: "delete",
            label: "",
            render: (row) => (
              <button className="bg-[#D74753] text-sm text-white px-3 py-1 rounded-xl cursor-pointer">
                삭제
              </button>
            ),
          },
        ]}
        data={products}
      />
      {selectedProduct && (
        <EditMenu productId={selectedProduct.id} onClose={closeEditMenuModal} />
      )}
    </>
  );
};

export default ProductList;
