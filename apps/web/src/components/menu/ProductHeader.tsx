import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";

interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");

  const handleBackClick = () => {
    if (category) {
      router.push(`/menu?category=${category}`);
    } else {
      router.push("/menu");
    }
  };

  return <PageHeader title={productName} onBackClick={handleBackClick} />;
}
