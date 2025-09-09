import { PageHeader } from "@/components/ui";
import { useProductNavigation } from "@/hooks";

interface ProductHeaderProps {
  productName?: string;
  showSkeleton?: boolean;
}

export default function ProductHeader({
  productName,
  showSkeleton = false,
}: ProductHeaderProps) {
  const { navigateBack } = useProductNavigation();

  return (
    <PageHeader
      title={productName || ""}
      onBackClick={navigateBack}
      showSkeleton={showSkeleton}
    />
  );
}
