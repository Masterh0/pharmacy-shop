"use client";

import ProductInfoCard from "./components/ProductInfoCard";
import VariantList from "./components/VariantList";
import { useProductById } from "@/lib/hooks/useProduct";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";

export default function EditProductPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading } = useProductById(id);

  if (isLoading) return <CircularProgress />;

  return (
    <div className="p-6 space-y-6">
      <ProductInfoCard initialData={data} />
      <VariantList productId={id} />
    </div>
  );
}
