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

  /* 🧩 بازیابی نوع مرتب‌سازی از localStorage */
  useEffect(() => {
    const savedSort =
      (localStorage.getItem("productSort") as
        | "newest"
        | "bestseller"
        | "cheapest"
        | "expensive"
        | "mostViewed"
        | null) || "newest";
    console.log("💾 [Sort loaded]", savedSort);
    setSort(savedSort);
  }, []);

  /* 🧩 پارامترها */
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const categoryId = Number(searchParams.get("id"));

  console.log("🔢 [Params]", { slug, categoryId });

  const { selectedCategory } = useCategoryStore();
  console.log("📦 [Zustand selectedCategory]", selectedCategory);

  const [categoryName, setCategoryName] = useState("دسته‌بندی نامشخص");

  /* 🔥 React Query با تایپ دقیق خروجی */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ProductsByCategoryResponse>({
    queryKey: ["category-products", categoryId, sort, page],
    queryFn: async () => {
      console.log("🚀 [QueryFn Triggered] Fetching products...", {
        id: categoryId,
        sort,
        page,
      });
      const res = await categoryApi.getProductsByCategory(categoryId, {
        sort,
        page,
        limit: 24,
      });
      console.log("✅ [API Response Raw]", res);
      return res;
    },
    enabled: !!categoryId,
    
  });

  /* 🧩 داده‌ها از پاسخ */
  console.log("📦 [Full API data]", data);

  const products = data?.data ?? [];
const pagination = data?.pagination;

  console.log("📊 [Query Result]", {
    productsCount: products.length,
    pagination,
    isLoading,
    isError,
  });

  /* ✅ محصولات فعال (برای اطمینان دوباره چاپ می‌کنیم) */
  const activeProducts = useMemo(
    () => products.filter((p: Product) => !p.isBlock),
    [products]
  );
  console.log("🎯 [Active Products]", activeProducts.length, activeProducts);

  /* ✅ هدر دسته */
  const firstProductCategoryName = useMemo(
    () => products[0]?.category?.name,
    [products]
  );

  useEffect(() => {
    if (selectedCategory?.name) {
      setCategoryName(selectedCategory.name);
      console.log("🏷 [Category Name from Zustand]", selectedCategory.name);
    } else if (firstProductCategoryName) {
      setCategoryName(firstProductCategoryName);
      console.log("🏷 [Category Name from First Product]", firstProductCategoryName);
    } else if (slug) {
      setCategoryName(decodeURIComponent(slug));
      console.log("🏷 [Category Name from Slug]", slug);
    }
  }, [selectedCategory?.name, firstProductCategoryName, slug]);

  /* 🧩 وضعیت‌های مختلف */
  if (isLoading)
    return (
      <div className="text-center py-20 text-gray-600">در حال بارگذاری...</div>
    );

  if (isError)
    return (
      <div className="text-center py-20 text-red-500">
        خطا در دریافت داده‌ها.{" "}
        <pre className="text-xs text-gray-500 mt-2">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );

  if (!activeProducts.length) {
    console.warn("⚠️ [No Active Products Found]", {
      totalProducts: products.length,
      categoryId,
      slug,
      data,
    });
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد.
      </div>
    );
  }

  /* ✅ رندر نهایی */
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

      {!!pagination?.totalPages && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            قبلی
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            صفحه {page} از {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((p) =>
                pagination.totalPages
                  ? Math.min(p + 1, pagination.totalPages)
                  : p
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      )}
    </main>
  );
}
