"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";

import { brandApi } from "@/lib/api/brandApi";
import type { Product } from "@/lib/types/product";
import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";
import axios from "axios";

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

export default function CategoryProductsClient() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    [searchParams],
  );

  const { data, isLoading, isFetching, isError, error } = useQuery({
    enabled: !!slug,
    queryKey: ["brand-products", slug, search], // ✅ SAME SOURCE
    queryFn: async () => {
      const res = await brandApi.getProductsBySlug(slug!, search);
      return res;
    },
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });

  const products: Product[] = data?.data ?? [];
  const brand = data?.brand;
  const pagination = data?.pagination;

  const activeProducts = useMemo(
    () => products.filter((p) => !p.isBlock),
    [products],
  );

  /* =============================
   🔥 filters (brands list)
  ============================= */

  const isFiltering = isFetching && !isLoading;

  /* =============================
   ✅ states
  ============================= */
  if (isLoading) {
    return (
      <div dir="ltr" className="w-full px-4 mt-6">
        {/* عنوان */}
        <div className="flex justify-center mb-6">
          <div className="h-9 w-64 rounded-lg bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>

        {/* تب‌های sort */}
        <div className="flex justify-center gap-6 mb-6 border-b pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-20 rounded bg-gray-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* گرید محصولات */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="relative">
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-44 w-full rounded-xl bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                </div>
                <div className="h-5 w-3/4 self-end rounded bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-4 w-1/2 self-end rounded bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-6 w-2/5 self-end rounded bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-11 w-full rounded-full bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>
            ))}
          </div>

          {/* ستون فیلتر */}
          <div className="w-[220px] shrink-0 border rounded-2xl p-4 flex flex-col gap-5 h-fit">
            <div className="flex justify-between">
              <div className="h-5 w-16 rounded bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
              <div className="h-5 w-20 rounded bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 justify-end">
                <div className="h-4 w-20 rounded bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-4 w-4 rounded bg-gray-200" />
              </div>
            ))}
            {[28, 36].map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-6 w-10 rounded-full bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div
                  className={`h-5 w-${w} rounded bg-gray-200 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>
            ))}
            <div className="h-2 w-full rounded-full bg-gray-200" />
            <div className="h-12 w-full rounded-xl bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    if (status === 404) {
      router.replace("/not-found");
      return null;
    }

    if (status === 500) {
      router.replace("/server-error");
      return null;
    }

    return (
      <div dir="rtl" className="text-center py-20">
        <h2 className="text-lg font-semibold text-red-500">
          خطا در دریافت محصولات
        </h2>
      </div>
    );
  }

  /* =============================
   ✅ render
  ============================= */
  return (
    <ProductsListingLayout
      title={`محصولات ${brand?.name ?? ""}`}
      products={activeProducts}
      sort={sort}
      setSort={setSort}
      pagination={{
        totalPages: pagination?.totalPages ?? 1,
        currentPage: page,
      }}
      setPage={setPage}
      brands={[]}
      isFiltering={isFiltering}
    />
  );
}
