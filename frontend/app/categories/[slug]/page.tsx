import { Suspense } from "react";
import CategoryProductsClient from "./CategoryProductsClient";

export default function CategoryProductsPage() {
  return (
    <Suspense fallback={<CategoryProductsLoading />}>
      <CategoryProductsClient />
    </Suspense>
  );
}

function CategoryProductsLoading() {
  return (
    <div className="text-center py-20 text-gray-600">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00B4D8]" />
        <p>در حال بارگذاری محصولات...</p>
      </div>
    </div>
  );
}
