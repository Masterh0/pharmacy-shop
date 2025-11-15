"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import ProductGridView from "@/src/components/products/ProductGridView";
import { useEffect, useState, useMemo } from "react";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { Product, ProductsByCategoryResponse } from "@/lib/types/product";

export default function CategoryProductsPage() {
  console.log("🟢 [Render] CategoryProductsPage mounted");

  const [sort, setSort] = useState<
    "newest" | "bestseller" | "cheapest" | "expensive" | "mostViewed"
  >("newest");
  const [page, setPage] = useState(1);

  /* 🧩 بازیابی مرتب‌سازی از localStorage */
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

  /* 🧩 گرفتن پارامترها */
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const categoryId = Number(searchParams.get("id"));

  const { selectedCategory } = useCategoryStore();
  const [categoryName, setCategoryName] = useState("دسته‌بندی نامشخص");

  /* 🔥 دریافت محصولات از API */
  const { data, isLoading, isError, error } = useQuery<ProductsByCategoryResponse>({
    queryKey: ["category-products", categoryId, sort, page],
    queryFn: async () => {
      const res = await categoryApi.getProductsByCategory(categoryId, {
        sort,
        page,
        limit: 24,
      });
      return res;
    },
    enabled: !!categoryId,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  /* فیلتر محصولات غیرمسدود */
  const activeProducts = useMemo(
    () => products.filter((p: Product) => !p.isBlock),
    [products]
  );

  /* نام دسته‌بندی */
  const firstProductCategoryName = useMemo(() => products[0]?.category?.name, [products]);

  useEffect(() => {
    if (selectedCategory?.name) {
      setCategoryName(selectedCategory.name);
    } else if (firstProductCategoryName) {
      setCategoryName(firstProductCategoryName);
    } else if (slug) {
      setCategoryName(decodeURIComponent(slug));
    }
  }, [selectedCategory?.name, firstProductCategoryName, slug]);

  /* ✅ وضعیت‌ها */
  if (isLoading)
    return <div className="text-center py-20 text-gray-600">در حال بارگذاری...</div>;

  if (isError)
    return (
      <div className="text-center py-20 text-red-500">
        خطا در دریافت داده‌ها.
        <pre className="text-xs text-gray-500 mt-2">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );

  if (!activeProducts.length)
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد.
      </div>
    );

  /* ✅ رندر نهایی */
  return (
    <main className="w-full flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold text-[#0077B6] mb-6">
        محصولات {categoryName}
      </h1>

      {/* 👇 پاس‌دادن همه‌ی دیتاهای لازم به ProductGridView */}
      <ProductGridView
        title=""
        products={activeProducts}
        sort={sort}
        setSort={setSort}
        pagination={{
          totalPages: pagination?.totalPages || 1,
          currentPage: page,
        }}
        setPage={setPage}
      />
    </main>
  );
}
