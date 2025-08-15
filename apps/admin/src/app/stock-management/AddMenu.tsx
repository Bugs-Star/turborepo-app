"use client";
import { useState } from "react";
import { Coffee, Utensils, Gift, UploadCloud } from "lucide-react";
import BaseForm from "@/components/BaseForm";

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
    <BaseForm
      title="새 메뉴 항목 추가"
      uploadLabel="메뉴 이미지"
      onSubmit={() => console.log("메뉴 업로드")}
      buttonLabel="메뉴 추가"
    >
      {/* children → 카테고리 선택 */}
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
    </BaseForm>
  );
};

export default AddMenu;
