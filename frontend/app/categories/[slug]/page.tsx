"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import ProductGridView from "@/src/components/products/ProductGridView";
import { useEffect, useState } from "react";
import { useCategoryStore } from "@/lib/stores/categoryStore";

export default function CategoryProductsPage() {
  const [sort, setSort] = useState<
    "newest" | "bestseller" | "cheapest" | "expensive"
  >("newest");

  // 🔹 بازیابی نوع مرتب‌سازی از localStorage هنگام mount
  useEffect(() => {
    const savedSort =
      (localStorage.getItem("productSort") as
        | "newest"
        | "bestseller"
        | "cheapest"
        | "expensive"
        | null) || "newest";
    setSort(savedSort);
  }, []);

  // ✅ گرفتن slug از مسیر و id از query string
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const categoryId = Number(searchParams.get("id")); // ← از URL مثل ?id=12

  // 🔹 خواندن دسته انتخاب‌شده از Zustand
  const { selectedCategory } = useCategoryStore();

  // 🔹 درخواست محصولات این دسته از API (با id نه slug)
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["category-products", categoryId, sort],
    queryFn: () => categoryApi.getProductsByCategory(categoryId, sort),
    enabled: !!categoryId, // فقط وقتی id معتبره فچ انجام بده
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-gray-600">در حال بارگذاری...</div>
    );

  if (isError)
    return (
      <div className="text-center py-20 text-red-500">
        خطا در دریافت داده‌ها.
      </div>
    );

  const activeProducts = products.filter((p) => !p.isBlock);

  if (!activeProducts.length)
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد.
      </div>
    );

  // 🔹 اولویت: نام دسته از Zustand → سپس از محصول اول → سپس fallback
  const categoryName =
    selectedCategory?.name ||
    activeProducts[0]?.category?.name ||
    "دسته‌بندی نامشخص";

  return (
    <main className="w-full flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold text-[#0077B6] mb-6">
        محصولات {categoryName}
      </h1>

      <ProductGridView
        title=""
        products={activeProducts}
        sort={sort}
        setSort={setSort}
      />
    </main>
  );
}
