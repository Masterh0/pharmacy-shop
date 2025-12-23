"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";

import {
  searchApi,
  SearchProduct,
  SortType,
  SearchResponse,
  SearchCategory,
  SearchBrand,
} from "@/lib/api/search";

import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reading URL values
  const query = searchParams.get("q") || "";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 12;
  const initialSort = (searchParams.get("sort") as SortType) || "newest";

  const [sort, setSort] = useState<SortType>("newest");
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [searchTitle, setSearchTitle] = useState("جستجو");

  // Load sort (URL > LocalStorage)
  useEffect(() => {
    const savedSort = (localStorage.getItem("productSort") as SortType) || "newest";
    setSort(initialSort || savedSort);
  }, [initialSort]);

  // Sync page with URL page
  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  // Push new URL ONLY IF params actually changed
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());

    let changed = false;

    if (currentParams.get("page") !== String(page)) {
      currentParams.set("page", String(page));
      changed = true;
    }

    if (currentParams.get("limit") !== String(limit)) {
      currentParams.set("limit", String(limit));
      changed = true;
    }

    if (currentParams.get("sort") !== sort) {
      if (sort !== "newest") currentParams.set("sort", sort);
      else currentParams.delete("sort");
      changed = true;
    }

    if (changed) {
      router.replace(`/search?${currentParams.toString()}`, { scroll: false });
    }

    localStorage.setItem("productSort", sort);
  }, [page, sort, limit, searchParams, router]);

  // Fetch data
  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ["search-results", query, sort, page, limit],
    queryFn: () =>
      searchApi.search({
        q: query,
        sort,
        page,
        limit,
      }),
    enabled: !!query,
  });

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const brands = data?.brands ?? [];
  const totalProducts = data?.total ?? 0;

  const totalPages = useMemo(() => {
    if (!totalProducts) return 1;
    return Math.ceil(totalProducts / limit);
  }, [totalProducts, limit]);

  useEffect(() => {
    setSearchTitle(query ? `نتایج جستجو برای: \`${query}\`` : "جستجو");
  }, [query]);

  const activeProducts = useMemo(
    () => products.filter((p) => !p.isBlock),
    [products]
  );

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // UI states
  if (!query) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        لطفاً عبارت مورد نظر خود را در نوار جستجو وارد کنید.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        در حال بارگذاری نتایج جستجو...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500">
        خطا در دریافت نتایج جستجو
        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  // No results
  if (!activeProducts.length && !categories.length && !brands.length) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        نتیجه‌ای برای `{query}` یافت نشد.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {searchTitle}
      </h1>

      {(categories.length > 0 || brands.length > 0) && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          {categories.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                دسته‌بندی‌های مرتبط:
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="px-3 py-1 bg-[#90E0EF] text-blue-800 rounded-full text-sm hover:bg-[#00B4D8] hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                برندهای مرتبط:
              </h2>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brand/${brand.slug}`}
                    className="px-3 py-1 bg-[#90E0EF] text-blue-800 rounded-full text-sm hover:bg-[#00B4D8] hover:text-white transition-colors"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeProducts.length > 0 ? (
        <ProductsListingLayout
          title=""
          products={activeProducts}
          sort={sort}
          setSort={setSort}
          pagination={{
            totalPages,
            currentPage: page,
          }}
          setPage={handleSetPage}
          brands={brands}
        />
      ) : (
        <div className="text-center py-10 text-gray-600">
          محصولی برای `{query}` یافت نشد.
        </div>
      )}
    </div>
  );
}
