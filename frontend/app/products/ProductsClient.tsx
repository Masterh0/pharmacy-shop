"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useMemo } from "react";

import { productApi } from "@/lib/api/products";

import type { Product } from "@/lib/types/product";

import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";

import { brandApi } from "@/lib/api/brandApi";

import axios from "axios";

export type SortType =
  | "latest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "most_viewed";

const DEFAULT_SORT: SortType = "latest";

const DEFAULT_PAGE = 1;

const safeNumber = (v: string | null): number | undefined => {
  if (!v) return undefined;

  const n = Number(v);

  return Number.isFinite(n) ? n : undefined;
};

export default function ProductsClient() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const sort = (searchParams.get("sort") as SortType) ?? DEFAULT_SORT;

  const page = safeNumber(searchParams.get("page")) ?? DEFAULT_PAGE;

  const search = useMemo(
    () => (searchParams.size ? `?${searchParams.toString()}` : ""),

    [searchParams],
  );

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["products", search],

    queryFn: () => productApi.getFiltered(search),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60,
  });

  const products: Product[] = data?.products ?? [];

  const pagination = data?.pagination;

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

  const { data: brands } = useQuery({
    queryKey: ["active-brands"],

    queryFn: brandApi.getActiveBrands,
  });

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

  return (
    <ProductsListingLayout
      title="همه محصولات"
      products={products}
      sort={sort}
      setSort={setSort}
      pagination={{
        currentPage: page,

        totalPages: pagination?.totalPages ?? 1,
      }}
      setPage={setPage}
      brands={brands ?? []}
      isLoading={isLoading}
      isFiltering={isFetching && !isLoading}
    />
  );
}
