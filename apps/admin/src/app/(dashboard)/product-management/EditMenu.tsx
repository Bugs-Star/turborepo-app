"use client";

import BaseForm from "@/components/BaseForm";
import { X, Coffee, Utensils, Gift } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useEditMenu } from "@/hooks/menu/useEditMenu";
import { notify } from "@/lib/notify";

/** === Types === */
type UiCategory = "drink" | "food" | "product";
type ApiCategory = "beverage" | "food" | "goods";

/** API에 보낼 수정 페이로드(명시 타입) */
type EditMenuPayload = {
  productImg?: File;
  productCode?: string;
  productName?: string;
  productContents?: string;
  category?: ApiCategory;
  price?: number;
  currentStock?: number;
  optimalStock?: number;
  isRecommended?: boolean;
  recommendedOrder?: number;
};

const categoryOptions: { key: UiCategory; icon: React.ElementType }[] = [
  { key: "drink", icon: Coffee },
  { key: "food", icon: Utensils },
  { key: "product", icon: Gift },
];

/** Props */
interface EditMenuProps {
  productId: string;
  initialData?: {
    productImgUrl?: string; // 기존 이미지 URL
    productImg?: File; // 선택적(이미 파일 객체로 있을 수 있음)
    productCode?: string;
    productName?: string;
    productContents?: string;
    category?: UiCategory; // UI 기준
    price?: number;
    currentStock?: number;
    optimalStock?: number;
    isRecommended?: boolean;
    recommendedOrder?: number;
  };
  onClose: () => void;
}

const uiToApiCategory = (c: UiCategory): ApiCategory =>
  c === "drink" ? "beverage" : c === "product" ? "goods" : "food";

const EditMenu: React.FC<EditMenuProps> = ({
  productId,
  initialData,
  onClose,
}) => {
  const { mutate, isPending } = useEditMenu(productId);

  const [selectedCategory, setSelectedCategory] = useState<UiCategory>(
    initialData?.category || "drink"
  );
  const [image, setImage] = useState<File | null>(null);

  const previewSrc = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return initialData?.productImgUrl ?? null;
  }, [image, initialData?.productImgUrl]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    // 파일이 새로 선택되었으면 교체
    if (image) fd.set("productImg", image);

    // UI 카테고리를 API 카테고리로 변환해 세팅
    fd.set("category", uiToApiCategory(selectedCategory));

    // 숫자 필드 정규화(문자열 → 숫자)
    const numKeys = [
      "price",
      "currentStock",
      "optimalStock",
      "recommendedOrder",
    ] as const;
    numKeys.forEach((key) => {
      const raw = fd.get(key)?.toString().trim();
      if (!raw) fd.delete(key);
      else fd.set(key, String(Number(raw)));
    });

    // 불리언 필드 정규화(체크박스 on/true/false → true/false)
    if (fd.has("isRecommended")) {
      const v = fd.get("isRecommended");
      fd.set("isRecommended", v === "on" || v === "true" ? "true" : "false");
    }

    // === FormData → 명시 타입 객체로 안전 변환 ===
    const payload: EditMenuPayload = {};
    const get = (k: string) => fd.get(k)?.toString();

    const productName = get("productName");
    if (productName) payload.productName = productName;

    const productCode = get("productCode");
    if (productCode) payload.productCode = productCode;

    const productContents = get("productContents");
    if (productContents) payload.productContents = productContents;

    const category = get("category");
    if (
      category === "beverage" ||
      category === "food" ||
      category === "goods"
    ) {
      payload.category = category;
    }

    const price = get("price");
    if (price !== undefined) {
      const n = Number(price);
      if (!Number.isNaN(n)) payload.price = n;
    }

    const currentStock = get("currentStock");
    if (currentStock !== undefined) {
      const n = Number(currentStock);
      if (!Number.isNaN(n)) payload.currentStock = n;
    }

    const optimalStock = get("optimalStock");
    if (optimalStock !== undefined) {
      const n = Number(optimalStock);
      if (!Number.isNaN(n)) payload.optimalStock = n;
    }

    const isRecommended = get("isRecommended");
    if (typeof isRecommended === "string") {
      payload.isRecommended = isRecommended === "true";
    }

    const recommendedOrder = get("recommendedOrder");
    if (recommendedOrder !== undefined) {
      const n = Number(recommendedOrder);
      if (!Number.isNaN(n)) payload.recommendedOrder = n;
    }

    const file = fd.get("productImg");
    if (file instanceof File) {
      payload.productImg = file;
    } else if (image) {
      payload.productImg = image;
    }

    mutate(payload, {
      onSuccess: () => {
        notify.success("메뉴가 수정되었습니다.");
        onClose();
      },
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
          aria-label="닫기"
        >
          <X size={24} />
        </button>

        <BaseForm
          title="메뉴 수정"
          uploadLabel="메뉴 이미지"
          buttonLabel={isPending ? "저장 중..." : "메뉴 수정"}
          imageFile={image}
          imagePreviewUrl={previewSrc || undefined}
          onImageChange={setImage}
          onSubmit={handleSubmit}
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
                  aria-pressed={selectedCategory === key}
                  aria-label={`카테고리 ${key}`}
                >
                  <Icon size={20} />
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
