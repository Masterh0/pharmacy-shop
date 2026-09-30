import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00B4D8] border-t-transparent" />

        <p className="text-gray-600">در حال بارگذاری محصولات...</p>
      </div>
    </div>
  );
}
