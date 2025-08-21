"use client";
import BaseForm from "@/components/BaseForm";
import { useEditMenu } from "@/hooks/useEditMenu";
import { X, Coffee, Utensils, Gift } from "lucide-react";
import { useState } from "react";

type CategoryType = "drink" | "food" | "product";

const categoryOptions: { key: CategoryType; icon: React.ElementType }[] = [
  { key: "drink", icon: Coffee },
  { key: "food", icon: Utensils },
  { key: "product", icon: Gift },
];

interface EditMenuProps {
  productId: string;
  initialData?: {
    productCode?: string;
    productName?: string;
    productContents?: string;
    category?: CategoryType;
    price?: number;
    currentStock?: number;
    optimalStock?: number;
    isRecommended?: boolean;
    recommendedOrder?: number;
  };
  onClose: () => void;
}

const EditMenu = ({ productId, initialData, onClose }: EditMenuProps) => {
  const { mutate } = useEditMenu(productId);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    initialData?.category || "drink"
  );
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (formData: FormData) => {
    const payload: any = Object.fromEntries(formData.entries());
    mutate({
      ...payload,
      price: Number(payload.price),
      currentStock: Number(payload.currentStock),
      optimalStock: Number(payload.optimalStock),
      category: selectedCategory,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={24} />
        </button>

        <BaseForm
          title="메뉴 수정"
          uploadLabel="메뉴 이미지"
          buttonLabel="메뉴 수정"
          imageFile={image}
          onImageChange={setImage}
          onSubmit={() =>
            handleSubmit(new FormData(document.querySelector("form")!))
          }
          headerExtra={
            <div className="flex gap-3 mb-4">
              {categoryOptions.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    selectedCategory === key
                      ? "bg-[#005C14] hover:bg-green-900 text-white"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={20} />
                </button>
              ))}
              <input type="hidden" name="category" value={selectedCategory} />
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
              name="productName"
              defaultValue={initialData?.productName}
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
              name="productCode"
              defaultValue={initialData?.productCode}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
            />
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가격 (원)
            </label>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* 재고 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 재고 수량
              </label>
              <input
                type="number"
                name="currentStock"
                defaultValue={initialData?.currentStock}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                적정 재고 수량
              </label>
              <input
                type="number"
                name="optimalStock"
                defaultValue={initialData?.optimalStock}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              name="productContents"
              defaultValue={initialData?.productContents}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
            />
          </div>
        </BaseForm>
      </div>
    </div>
  );
};

export default EditMenu;
