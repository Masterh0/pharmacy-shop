"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { categoryApi } from "@/lib/api/category";
import ProductGridView from "@/src/components/products/ProductGridView";
import { Product } from "@/lib/types/product";
import { ProductsByCategoryBySlugResponse } from "@/lib/types/category";

type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";

export default function CategoryProductsPage() {
  /* ✅ params */
  const { slug } = useParams<{ slug: string }>();

  /* ✅ state */
  const [sort, setSort] = useState<SortType>("newest");
  const [page, setPage] = useState(1);
  const [categoryName, setCategoryName] =
    useState("دسته‌بندی نامشخص");

  /* ✅ load sort from localStorage */
  useEffect(() => {
    const savedSort =
      (localStorage.getItem("productSort") as SortType) || "newest";
    setSort(savedSort);
  }, []);

  /* ✅ fetch products by slug */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ProductsByCategoryBySlugResponse>({
    queryKey: ["category-products", slug, sort, page],
    queryFn: () =>
      categoryApi.getProductsByCategoryBySlug(slug, {
        sort,
        page,
        limit: 24,
      }),
    enabled: !!slug,
  });

  /* ✅ extract data */
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  /* ✅ only active products */
  const activeProducts = useMemo(
    () => products.filter((p: Product) => !p.isBlock),
    [products]
  );

  /* ✅ category name */
  useEffect(() => {
    if (data?.category?.name) {
      setCategoryName(data.category.name);
    } else if (slug) {
      setCategoryName(decodeURIComponent(slug));
    }
  }, [data?.category?.name, slug]);

  /* ✅ UI states */
  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-600">
        در حال بارگذاری...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        خطا در دریافت محصولات
        <pre className="mt-2 text-xs text-gray-500">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!activeProducts.length) {
    return (
      <div className="text-center py-20 text-gray-600">
        محصولی برای این دسته یافت نشد
      </div>
    );
  }

  /* ✅ render */
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

      {!!pagination?.totalPages &&
        pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => Math.max(p - 1, 1))
              }
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
                  Math.min(p + 1, pagination.totalPages)
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
