import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";

interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");
  const from = searchParams.get("from");

  const handleBackClick = () => {
    if (from === "home") {
      router.push("/home"); // 홈에서 온 경우 홈으로 돌아가기
    } else if (category) {
      router.push(`/menu?category=${category}`); // 카테고리 유지하며 메뉴로
    } else {
      router.push("/menu"); // 일반 메뉴로
    }
  };

  return <PageHeader title={productName} onBackClick={handleBackClick} />;
}
