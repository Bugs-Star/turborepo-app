"use client";

import { useGetAllProducts } from "@/hooks/menu/useGetAllProducts";
import AddMenu from "./AddMenu";
import ProductList from "./ProductList";
import StockAlert from "./StockAlert";

const ProductManagement = () => {
  const { data } = useGetAllProducts();
  return (
    <>
      <AddMenu />
      <StockAlert products={data?.products ?? []} />
      <ProductList />
    </>
  );
};

export default ProductManagement;
