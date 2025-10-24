"use client";

import { useParams } from "next/navigation";
import { useProductById } from "@/lib/hooks/useProduct";
import AddProductForm from "@/src/components/products/AddProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProductById(Number(id));

  if (isLoading) return <p>در حال بارگذاری محصول...</p>;
  if (isError) return <p>❌ خطایی در دریافت اطلاعات محصول رخ داد.</p>;
  if (!product) return <p>محصول یافت نشد.</p>;

  return (
    <div dir="rtl" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
        📝 ویرایش محصول {product.name}
      </h1>

      <AddProductForm mode="edit" initialData={product} />
    </div>
  );
}
