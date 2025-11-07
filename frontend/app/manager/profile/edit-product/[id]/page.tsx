"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import EditProductForm from "@/src/components/products/EditProductForm";
import VariantsTable from "./VariantsTable";
import { productApi } from "@/lib/api/products";
import { variantApi } from "@/lib/api/variantApi";
import AddProductForm from "@/src/components/products/AddProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  
  // 🧩 دریافت اطلاعات محصول
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productApi.getById(productId),
    enabled: !!productId,
    
  });
    
  // 🧩 دریافت لیست واریانت‌ها
  const { data: variants, isLoading: loadingVariants } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: () => variantApi.getAllByProductId(productId),
    enabled: !!productId,
  });

  if (loadingProduct || loadingVariants) {
    return <div className="p-10 text-gray-500">در حال بارگذاری محصول...</div>;
  }

  if (!product) {
    return <div className="p-10 text-red-600">محصول پیدا نشد 😕</div>;
  }
  console.log(variants)
  return (
    <div className="p-10 space-y-8">
      {/* فرم اطلاعات اصلی محصول */}
      <EditProductForm  initialData={product} />

      {/* جدول واریانت‌ها */}
      <VariantsTable productId={productId} variants={variants ?? []} />
    </div>
  );
}
