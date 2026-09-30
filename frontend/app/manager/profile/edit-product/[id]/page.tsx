"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import EditProductForm from "@/src/components/products/EditProductForm";
import VariantsTable from "./VariantsTable";
import { productApi } from "@/lib/api/products";
import { variantApi } from "@/lib/api/variantApi";
import VariantsManager from "@/src/components/forms/VariantsManager";

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
    queryFn: async () => {
      const result = await variantApi.getAllByProductId(productId);
      return result;
    },
    enabled: !!productId,
  });

  if (loadingProduct || loadingVariants) {
    return <div className="p-10 text-gray-500">در حال بارگذاری محصول...</div>;
  }

  if (!product) {
    return <div className="p-10 text-red-600">محصول پیدا نشد 😕</div>;
  }
  return (
    <div className="p-10 space-y-8">
      {/* فرم اطلاعات اصلی محصول */}
      <EditProductForm initialData={product} />
      {/* جدول واریانت‌ها */}
      <VariantsManager productId={productId} />
    </div>
  );
}
