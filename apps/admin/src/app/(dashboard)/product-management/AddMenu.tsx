"use client";
import { useState } from "react";
import { Coffee, Utensils, Gift } from "lucide-react";
import BaseForm from "@/components/BaseForm";
import { useAddMenu } from "@/hooks/useAddMenu";
import { AddProductPayload } from "@/lib/products";

type CategoryType = "drink" | "food" | "product";

const categoryOptions: { key: CategoryType; icon: React.ElementType }[] = [
  { key: "drink", icon: Coffee },
  { key: "food", icon: Utensils },
  { key: "product", icon: Gift },
];

const AddMenu = () => {
  const [category, setCategory] = useState<CategoryType>("drink");
  const [price, setPrice] = useState<number>(0);

  const { addMenu, isLoading, error } = useAddMenu();

  const handleSubmit = async (formData: FormData) => {
    const image = formData.get("image");
    const title = formData.get("title");
    const description = formData.get("description");

    if (!image || !(image instanceof File)) {
      alert("이미지를 선택해주세요.");
      return;
    }
    if (!title || typeof title !== "string") {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!description || typeof description !== "string") {
      alert("설명을 입력해주세요.");
      return;
    }
    if (!price || price <= 0) {
      alert("가격을 입력해주세요.");
      return;
    }

    try {
      const payload: AddProductPayload = {
        productCode: title,
        productName: title,
        productImg: image,
        productContents: description,
        category:
          category === "drink"
            ? "beverage"
            : category === "food"
              ? "food"
              : "goods",
        price,
        optimalStock: 10, // 기본값
      };

      await addMenu(payload);
      alert("상품이 추가되었습니다!");
    } catch (err) {
      console.error(err);
      alert(error || "상품 추가 실패");
    }
  };

  return (
    <BaseForm
      title="새 메뉴 항목 추가"
      uploadLabel="메뉴 이미지"
      onSubmit={handleSubmit}
      buttonLabel={isLoading ? "업로드 중..." : "메뉴 추가"}
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
              <Icon className="cursor-pointer" />
            </button>
          ))}
        </div>
      }
    >
      {/* 가격 입력 */}
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
    </BaseForm>
  );
};

export default AddMenu;
