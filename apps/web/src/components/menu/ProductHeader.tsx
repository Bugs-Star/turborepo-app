import { PageHeader } from "@/components/ui";

interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  return <PageHeader title={productName} />;
}
