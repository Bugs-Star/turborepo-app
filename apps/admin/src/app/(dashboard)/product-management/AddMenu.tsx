"use client";
import { useState } from "react";
import { Coffee, Utensils, Gift } from "lucide-react";
import BaseForm from "@/components/BaseForm";
import { AddProductPayload, ProductsService } from "@/lib/products";

type CategoryType = "drink" | "food" | "product";

const categoryOptions: { key: CategoryType; icon: React.ElementType }[] = [
  { key: "drink", icon: Coffee },
  { key: "food", icon: Utensils },
  { key: "product", icon: Gift },
];

const AddMenu = () => {
  const [category, setCategory] = useState<CategoryType>("drink");
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [price, setPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [optimalStock, setOptimalStock] = useState(0);
  const [description, setDescription] = useState("");
  const [productImg, setProductImg] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productImg) {
      alert("이미지를 선택해주세요.");
      return;
    }
    if (!productName) {
      alert("메뉴 이름을 입력해주세요.");
      return;
    }
    if (!price || price <= 0) {
      alert("가격을 올바르게 입력해주세요.");
      return;
    }

    const payload: AddProductPayload = {
      productCode: productCode || productName,
      productName,
      productImg,
      productContents: description,
      category:
        category === "drink"
          ? "beverage"
          : category === "food"
            ? "food"
            : "goods",
      price,
      currentStock,
      optimalStock,
    };

    try {
      setIsLoading(true);
      await ProductsService.addProduct(payload);
      alert("상품이 추가되었습니다!");
      // 필요 시 초기화
      setProductName("");
      setProductCode("");
      setPrice(0);
      setCurrentStock(0);
      setOptimalStock(0);
      setDescription("");
      setProductImg(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "상품 추가 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseForm
      title="새 메뉴 항목 추가"
      uploadLabel="메뉴 이미지"
      buttonLabel={isLoading ? "업로드 중..." : "메뉴 추가"}
      imageFile={productImg}
      onImageChange={setProductImg}
      onSubmit={handleSubmit}
      headerExtra={
        <div className="flex gap-3 mb-6">
          {categoryOptions.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                category === key
                  ? "bg-[#005C14] text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <Icon />
            </button>
          ))}
        </div>
      }
    >
      {/* 메뉴 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메뉴 이름
        </label>
        <input
          type="text"
          placeholder="예: 아메리카노"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
        />
      </div>

      {/* 메뉴 코드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메뉴 코드
        </label>
        <input
          type="text"
          placeholder="예: hot_americano"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
        />
      </div>

      {/* 가격 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          가격
        </label>
        <input
          type="number"
          placeholder="예: 5,500"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
        />
      </div>

      {/* 재고 */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            현재 재고 수량
          </label>
          <input
            type="number"
            placeholder="예: 100"
            value={currentStock}
            onChange={(e) => setCurrentStock(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            적정 재고 수량
          </label>
          <input
            type="number"
            placeholder="예: 50"
            value={optimalStock}
            onChange={(e) => setOptimalStock(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
          />
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          placeholder="자세한 설명을 입력하세요."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
        />
      </div>
    </BaseForm>
  );
};

export default AddMenu;
