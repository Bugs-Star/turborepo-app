import { useRouter, useSearchParams } from "next/navigation";

/**
 * 상품 상세페이지에서 뒤로가기 네비게이션을 위한 훅
 * ProductHeader와 CartSuccessModal에서 공통으로 사용
 */
export const useProductNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateBack = () => {
    const from = searchParams.get("from");
    const category = searchParams.get("category");

    if (from === "home") {
      router.push("/home");
    } else if (from === "cart") {
      router.push("/cart");
    } else if (from === "order-history") {
      router.push("/order-history");
    } else if (category) {
      router.push(`/menu?category=${category}`);
    } else {
      router.push("/menu");
    }
  };

  return { navigateBack };
};
