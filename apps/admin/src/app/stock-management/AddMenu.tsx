"use client";
import { useState } from "react";
import { Coffee, Utensils, Gift, UploadCloud } from "lucide-react";

type CategoryType = "drink" | "food" | "product";

const categoryOptions: {
  key: CategoryType;
  icon: React.ElementType;
}[] = [
  { key: "drink", icon: Coffee },
  { key: "food", icon: Utensils },
  { key: "product", icon: Gift },
];

const AddMenu = () => {
  const [category, setCategory] = useState<CategoryType>("drink");

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white">
      <h1 className="text-2xl font-bold mb-6">새 메뉴 항목 추가</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 업로드 */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-64 cursor-pointer hover:bg-gray-50">
          <UploadCloud className="text-gray-400 w-10 h-10 mb-2" />
          <p className="text-gray-500">이미지 업로드</p>
        </div>

        {/* 폼 */}
        <div>
          {/* 카테고리 선택 */}
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
                <Icon className="cursor-pointer" />
              </button>
            ))}
          </div>

          {/* 입력 필드 */}
          <div className="space-y-4">
            {/* 메뉴 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메뉴 이름
              </label>
              <input
                type="text"
                placeholder="예: 시그니처 라떼"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
              />
            </div>

            {/* 현재 재고 수량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 재고 수량
              </label>
              <input
                type="number"
                placeholder="예: 100"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
              />
            </div>

            {/* 적정 재고 수량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                적정 재고 수량
              </label>
              <input
                type="number"
                placeholder="예: 50"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                placeholder="메뉴에 대한 자세한 설명을 입력하세요."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
              />
            </div>
          </div>

          {/* 버튼 */}
          <button
            type="button"
            className="mt-6 w-full bg-[#005C14] hover:bg-green-900 text-white font-bold py-3 rounded-lg cursor-pointer"
          >
            메뉴 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;
