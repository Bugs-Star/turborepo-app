"use client";

import { useState } from "react";
import { Coffee, Utensils, Gift, Star } from "lucide-react";
import BaseForm from "@/components/BaseForm";
import type { AddProductPayload } from "@/lib/api/products";
import { useAddMenu } from "@/hooks/menu/useAddMenu";
import { AxiosError } from "axios";

type CategoryType = "drink" | "food" | "product";

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  const ax = err as AxiosError<{ message?: string }>;
  if (ax?.isAxiosError)
    return ax.response?.data?.message || ax.message || "요청 오류";
  if (err instanceof Error) return err.message;
  return "상품 추가 실패";
}

const categoryOptions: {
  key: CategoryType;
  icon: React.ElementType;
  label: string;
}[] = [
  { key: "drink", icon: Coffee, label: "음료" },
  { key: "food", icon: Utensils, label: "음식" },
  { key: "product", icon: Gift, label: "상품" },
];

// 재사용 인풋 클래스 (다크 토큰 대응)
const inputCls =
  "w-full rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border)]";

const AddMenu = () => {
  const [category, setCategory] = useState<CategoryType>("drink");
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [price, setPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [optimalStock, setOptimalStock] = useState(0);
  const [description, setDescription] = useState("");
  const [productImg, setProductImg] = useState<File | null>(null);
  const [isRecommended, setIsRecommended] = useState(false); // ⭐

  const { mutate: addMenu, isPending } = useAddMenu();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (!productImg) return alert("이미지를 선택해주세요.");
    if (!productName.trim()) return alert("메뉴 이름을 입력해주세요.");
    if (!price || price <= 0) return alert("가격을 올바르게 입력해주세요.");

    const payload: AddProductPayload = {
      productCode: (productCode || productName).trim(),
      productName: productName.trim(),
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
      isRecommended,
    };

    addMenu(payload, {
      onSuccess: () => {
        alert("상품이 추가되었습니다!");
        setCategory("drink");
        setProductName("");
        setProductCode("");
        setPrice(0);
        setCurrentStock(0);
        setOptimalStock(0);
        setDescription("");
        setProductImg(null);
        setIsRecommended(false);
      },
      onError: (err) => {
        alert(getErrorMessage(err));
      },
    });
  };

  return (
    <BaseForm
      title="새 메뉴 항목 추가"
      uploadLabel="메뉴 이미지"
      buttonLabel={isPending ? "업로드 중..." : "메뉴 추가"}
      imageFile={productImg}
      onImageChange={setProductImg}
      onSubmit={handleSubmit}
      /* 헤더 좌: 카테고리 탭 / 우: 추천 별 버튼 */
      headerExtra={
        <div className="mb-6 flex items-center justify-between">
          {/* 카테고리 탭 */}
          <div className="flex gap-3">
            {categoryOptions.map(({ key, icon: Icon, label }) => {
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition cursor-pointer
                    ${
                      active
                        ? "bg-brand text-white border-[color:var(--color-brand)]"
                        : "bg-muted text-card-foreground border border-border hover:opacity-90"
                    }`}
                  aria-pressed={active}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              );
            })}
          </div>

          {/* 추천 토글 */}
          <button
            type="button"
            aria-pressed={isRecommended}
            onClick={() => setIsRecommended((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition cursor-pointer
              ${
                isRecommended
                  ? "bg-accent text-white  border-[color:var(--color-accent)]"
                  : "bg-muted text-card-foreground border border-border hover:opacity-90"
              }`}
            title="추천메뉴 등록"
          >
            <Star
              className="w-4 h-4"
              {...(isRecommended
                ? { fill: "currentColor", stroke: "currentColor" }
                : {})}
            />
            <span>추천메뉴</span>
          </button>
        </div>
      }
    >
      {/* 폼 필드들 */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          메뉴 이름
        </label>
        <input
          type="text"
          placeholder="예: 시그니처 라떼"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          메뉴 코드
        </label>
        <input
          type="text"
          placeholder="예: hot_americano"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          가격 (원)
        </label>
        <input
          type="number"
          min={0}
          placeholder="예: 5,500"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className={inputCls}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            현재 재고 수량
          </label>
          <input
            type="number"
            min={0}
            placeholder="예: 100"
            value={currentStock}
            onChange={(e) => setCurrentStock(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            적정 재고 수량
          </label>
          <input
            type="number"
            min={0}
            placeholder="예: 50"
            value={optimalStock}
            onChange={(e) => setOptimalStock(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          설명
        </label>
        <textarea
          placeholder="메뉴에 대한 자세한 설명을 입력하세요."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} min-h-[100px]`}
        />
      </div>
    </BaseForm>
  );
};

export default AddMenu;
