import { PageHeader } from "@/components/ui";
import { useProductNavigation } from "@/hooks";

interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  const { navigateBack } = useProductNavigation();

  return <PageHeader title={productName} onBackClick={navigateBack} />;
}
