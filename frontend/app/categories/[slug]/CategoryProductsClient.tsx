"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";

import { categoryApi } from "@/lib/api/category";
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
    queryKey: ["category-products", slug, search], // ✅ SAME SOURCE
    queryFn: () => {
      return categoryApi.getProductsByCategoryBySlug(slug!, search);
    },
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const products: Product[] = data?.products ?? [];
  const category = data?.category;
  const pagination = data?.pagination;

  const activeProducts = useMemo(
    () => products.filter((p) => !p.isBlock),
    [products],
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
  const isFiltering = isFetching && !isLoading;

  /* =============================
   ✅ states
  ============================= */

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
      isLoading={isLoading}
      isFiltering={isFiltering}
    />
  );
}
