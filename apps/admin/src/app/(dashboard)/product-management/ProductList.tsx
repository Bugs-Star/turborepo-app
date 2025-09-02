"use client";
import { useState } from "react";
import DraggableList from "@/components/DraggableList";
import EditMenu from "./EditMenu";
import { useGetAllProducts } from "@/hooks/menu/useGetAllProducts";
import { useDeleteMenu } from "@/hooks/menu/useDeleteMenu";

type UIProduct = {
  id: string;
  name: string;
  code: string;
  image: string;
  category: "beverage" | "food" | "goods";
  price: number;
  currentStock?: number;
  optimalStock?: number;
  productContents?: string;
};

const apiToUiCategory = (c: "beverage" | "food" | "goods") =>
  c === "beverage" ? "drink" : c === "goods" ? "product" : "food";

export default function ProductList() {
  const { data } = useGetAllProducts();
  const products: UIProduct[] =
    data?.products.map((p) => ({
      id: p._id,
      name: p.productName,
      code: p.productCode,
      image: p.productImg,
      category: p.category,
      price: p.price,
      currentStock: p.currentStock,
      optimalStock: p.optimalStock,
      productContents: p.productContents,
    })) ?? [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any | null>(null);
  const { mutate: deleteMenu, isPending } = useDeleteMenu();

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setInitialData({
      productName: p.name,
      productCode: p.code,
      productContents: p.productContents,
      category: apiToUiCategory(p.category),
      price: p.price,
      currentStock: p.currentStock,
      optimalStock: p.optimalStock,
    });
    setOpen(true);
  };

  return (
    <>
      <DraggableList
        items={products.map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
        }))}
        onReorder={() => {}}
        onEdit={handleEdit}
        onDelete={(id) => {
          if (confirm("정말 삭제할까요?")) deleteMenu(id);
        }}
      />

      {open && editingId && (
        <EditMenu
          productId={editingId}
          initialData={initialData ?? undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
