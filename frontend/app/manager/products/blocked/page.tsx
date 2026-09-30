"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
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

export default function AdminBlockedProductsPage() {
  const searchParams = new URLSearchParams();
  const router = useRouter();

  /* =============================
   ✅ URL = SOT
  ============================= */
  const sort = (searchParams.get("sort") as SortType) ?? DEFAULT_SORT;
  const page = safeNumber(searchParams.get("page")) ?? DEFAULT_PAGE;

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
   🔥 API (ONLY BLOCKED ✅)
  ============================= */
  const search = useMemo(
    () => (searchParams.size ? `?${searchParams.toString()}` : ""),
    [searchParams],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-blocked-products", search],
    queryFn: () => categoryApi.getAdminBlockedProducts(search),
  });

  const products: Product[] = data?.products ?? [];
  const pagination = data?.pagination;

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
        خطا در دریافت محصولات بلاک‌شده
        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  /* =============================
   ✅ render
  ============================= */
  return (
    <ProductsListingLayout
      title="محصولات بلاک‌شده"
      products={products}
      sort={sort}
      setSort={setSort}
      pagination={{
        totalPages: pagination?.totalPages ?? 1,
        currentPage: page,
      }}
      setPage={setPage}
      brands={[]} // ✅ بلاک‌شده‌ها category ندارن → خالی
    />
  );
}
