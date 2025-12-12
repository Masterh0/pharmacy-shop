"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/types/product";
import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";
export type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";
export default function CategoryProductsPage() {
  console.log("🟢 [Render] CategoryProductsPage mounted");

  const { slug } = useParams<{ slug: string }>();

  const [sort, setSort] = useState<SortType>("newest");
  const [page, setPage] = useState(1);
  const [categoryName, setCategoryName] = useState("دسته‌بندی");

  /* ✅ load sort from localStorage */
  useEffect(() => {
    const savedSort =
      (localStorage.getItem("productSort") as SortType) || "newest";
    setSort(savedSort);
  }, []);

  /* 🔥 fetch data by slug */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category-products", slug, sort, page],
    queryFn: () =>
      categoryApi.getProductsByCategoryBySlug(slug!, {
        sort,
        page,
        limit: 24,
      }),
    enabled: !!slug,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const category = data?.category;

  /* ✅ category name */
  useEffect(() => {
    if (category?.name) {
      setCategoryName(category.name);
    }
  }, [category?.name]);

  /* ✅ filter blocked products */
  const activeProducts = useMemo(
    () => products.filter((p: Product) => !p.isBlock),
    [products]
  );

  /* ✅ states */
  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-600">در حال بارگذاری...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        خطا در دریافت محصولات
        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!activeProducts.length) {
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد.
      </div>
    );
  }

  /* ✅ render with reusable layout */
  return (
    <ProductsListingLayout
      title={`محصولات ${categoryName}`}
      products={activeProducts}
      sort={sort}
      setSort={setSort}
      pagination={{
        totalPages: pagination?.totalPages || 1,
        currentPage: page,
      }}
      setPage={setPage}
    />
  );
}
