"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { categoryApi } from "@/lib/api/category";
import type { Product } from "@/lib/types/product";
import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";

/* =============================
 ✅ types & constants
============================= */
export type SortType =
  | "latest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "most_viewed";

const DEFAULT_SORT: SortType = "latest";
const DEFAULT_PAGE = 1;

/* =============================
 ✅ helpers
============================= */
const safeNumber = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  /* =============================
   ✅ URL = SOT (read only)
  ============================= */
  const sort = (searchParams.get("sort") as SortType) ?? DEFAULT_SORT;

  const page = safeNumber(searchParams.get("page")) ?? DEFAULT_PAGE;

  // فقط برای UI استفاده می‌شن (نه API)
  const minPrice = safeNumber(searchParams.get("minPrice"));
  const maxPrice = safeNumber(searchParams.get("maxPrice"));
  const discount = searchParams.get("discount") === "1";
  const available = searchParams.get("available") === "1";

  const selectedBrandIds = useMemo(() => {
    const ids = searchParams.getAll("brand").map(Number).filter(Boolean);
    return ids.length ? ids : undefined;
  }, [searchParams]);

  /* =============================
   ✅ URL writers
  ============================= */
  const setSort = (nextSort: SortType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  };

  /* =============================
   🔥 products (FINAL ✅)
  ============================= */
  const search = useMemo(
    () => (searchParams.size ? `?${searchParams.toString()}` : ""),
    [searchParams]
  );

  const { data, isLoading, isError, error } = useQuery({
    enabled: !!slug,
    queryKey: ["category-products", slug, search], // ✅ SAME SOURCE
    queryFn: () => {
      console.log("🚀 FETCHING WITH:", search);
      return categoryApi.getProductsByCategoryBySlug(slug!, search);
    },
  });

  const products: Product[] = data?.products ?? [];
  const category = data?.category;
  const pagination = data?.pagination;

  const activeProducts = useMemo(
    () => products.filter((p) => !p.isBlock),
    [products]
  );

  /* =============================
   🔥 filters (brands list)
  ============================= */
  const { data: filtersData } = useQuery({
    enabled: !!category?.id,
    queryKey: ["category-filters", category?.id],
    queryFn: () => categoryApi.getCategoryFilters(category!.id),
  });

  const brands = filtersData?.brands ?? [];

  /* =============================
   ✅ states
  ============================= */
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

  /* =============================
   ✅ render
  ============================= */
  return (
    <ProductsListingLayout
      title={`محصولات ${category?.name ?? ""}`}
      products={activeProducts}
      sort={sort}
      setSort={setSort}
      pagination={{
        totalPages: pagination?.totalPages ?? 1,
        currentPage: page,
      }}
      setPage={setPage}
      brands={brands}
    />
  );
}
