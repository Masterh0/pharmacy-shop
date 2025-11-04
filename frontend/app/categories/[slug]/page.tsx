"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import ProductGridView from "@/src/components/products/ProductGridView";
import { useEffect, useState } from "react";
import { useCategoryStore } from "@/lib/stores/categoryStore";

export default function CategoryProductsPage() {
  const [sort, setSort] = useState<
    "newest" | "bestseller" | "cheapest" | "expensive" | "mostViewed"
  >("newest");

  // 🔹 بازیابی نوع مرتب‌سازی از localStorage هنگام mount
  useEffect(() => {
    const savedSort =
      (localStorage.getItem("productSort") as
        | "newest"
        | "bestseller"
        | "cheapest"
        | "expensive"
        | "mostViewed"
        | null) || "newest";
    setSort(savedSort);
  }, []);

  // ✅ گرفتن slug از مسیر و id از query string
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const categoryId = Number(searchParams.get("id")); // e.g. /categories/sport?id=12

  // ✅ خواندن دسته انتخاب‌شده از Zustand
  const { selectedCategory } = useCategoryStore();

  // ✅ نام دسته صفحه (ابتدا مقدار پیش‌فرض)
  const [categoryName, setCategoryName] = useState("دسته‌بندی نامشخص");

  // ✅ محصولات دسته را فچ کن
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["category-products", categoryId, sort],
    queryFn: () => categoryApi.getProductsByCategory(categoryId, sort),
    enabled: !!categoryId,
  });

  // ✅ وقتی داده‌ها یا دسته‌ انتخاب شده عوض شد، اسم هدر را تنظیم کن
  useEffect(() => {
    if (selectedCategory?.name) {
      setCategoryName(selectedCategory.name);
    } else if (products.length > 0 && products[0]?.category?.name) {
      setCategoryName(products[0].category.name);
    } else if (slug) {
      // آخرین fallback: از slug‌ استفاده کن (در صورت فارسی‌سازی می‌تونی decodeURIComponent کنی)
      setCategoryName(decodeURIComponent(slug));
    }
  }, [selectedCategory, products, slug]);

  // ✅ وضعیت‌های لودینگ / خطا
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

  // ✅ حذف محصولات غیرفعال
  const activeProducts = products.filter((p) => !p.isBlock);

  if (!activeProducts.length)
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد.
      </div>
    );

  // ✅ رندر نهایی
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
