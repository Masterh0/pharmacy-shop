"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";

import { searchApi, SortType, SearchResponse } from "@/lib/api/search";

import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";
import type { Product } from "@/lib/types/product";
import { useLoading } from "@/src/components/LoadingProvider";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();

  // ✅ URL params
  const query = searchParams.get("q") || "";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 12;
  const initialSort = (searchParams.get("sort") as SortType) || "newest";

  // ✅ State
  const [sort, setSort] = useState<SortType>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [searchTitle, setSearchTitle] = useState("جستجو");

  const brandFilter = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const categoryFilter = searchParams.get("category");
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", "1");
    params.set("limit", String(limit));
    router.push(`/search?${params.toString()}`, { scroll: false });
  }, [query, limit, router]);
  const hasActiveFilter = !![
    brandFilter,
    minPrice,
    maxPrice,
    categoryFilter,
  ].find(Boolean);
  const canSearch = query.length >= 2 || hasActiveFilter;
  // ✅ Sync URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (sort !== "newest") params.set("sort", sort);
    else params.delete("sort");

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [page, sort, limit, router, searchParams]);

  // ✅ Fetch
  const { data, isLoading, isFetching, isError, error } =
    useQuery<SearchResponse>({
      queryKey: [
        "search",
        query,
        hasActiveFilter,
        brandFilter,
        minPrice,
        maxPrice,
        categoryFilter,
        sort,
        page,
        limit,
      ],
      queryFn: async () => {
        showLoading("در حال جستجو...");
        try {
          return await searchApi.search({
            q: query,
            brand: brandFilter || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            category: categoryFilter || undefined,
            sort,
            page,
            limit,
          });
        } finally {
          hideLoading();
        }
      },
      enabled: canSearch, // ✅ بهجای !query
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });

  // ✅ Filter blocked
  const filteredProducts = useMemo(
    () => (data?.products ?? []).filter((p) => !p.isBlock),
    [data?.products],
  );

  const categories = data?.categories ?? [];
  const brands = data?.brands ?? [];
  const totalProducts = data?.total ?? 0;

  const totalPages = useMemo(() => {
    if (!totalProducts) return 1;
    return Math.ceil(totalProducts / limit);
  }, [totalProducts, limit]);

  useEffect(() => {
    if (query) setSearchTitle(`نتایج جستجو برای «${query}»`);
    else if (hasActiveFilter) setSearchTitle("نتایج فیلتر");
    else setSearchTitle("جستجو");
  }, [query, hasActiveFilter]);

  // ✅ ✅ ✅ تبدیل نهایی محصولات (اصل ماجرا)
  const convertedProducts: (Product & { hasStock: boolean })[] = useMemo(
    () =>
      filteredProducts.map((p) => {
        const variants = (p.variants || []).map((v) => ({
          id: typeof v === "object" && "id" in v ? v.id : 0,
          price: Number(v.price) || 0, // ✅ قیمت اصلی
          discountPrice: v.discountPrice ? Number(v.discountPrice) : 0, // ✅ قیمت با تخفیف
          stock: typeof v === "object" && "stock" in v ? (v.stock ?? 0) : 0,
        }));

        // ✅ آیا حداقل یک واریانت موجود هست؟
        const hasStock = variants.some((v) => v.stock > 0);

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: "",
          description: "",
          imageUrl: p.imageUrl,
          isBlock: p.isBlock,
          brandId: p.brand?.id ?? null,
          brand: p.brand
            ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug }
            : null,
          categoryId: p.category?.id ?? null,
          category: p.category
            ? {
                id: p.category.id,
                name: p.category.name,
                slug: p.category.slug,
              }
            : null,
          variants,
          hasStock,
          displayPrice: Number(p.displayPrice) || 0,
          displayDiscountPrice:
            p.displayDiscountPrice != null
              ? Number(p.displayDiscountPrice)
              : null,
          discountPercent: Number(p.discountPercent ?? 0),
          effectivePrice: Number(p.effectivePrice) || 0,
          displayVariant: p.displayVariant ?? null,
        };
      }),
    [filteredProducts],
  );

  // ✅ Handlers
  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSortChange = useCallback((newSort: SortType) => {
    setSort(newSort);
  }, []);

  // ✅ States
  if (!canSearch) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        لطفاً عبارت مورد نظر خود را در نوار جستجو وارد کنید.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500">
        خطا در دریافت نتایج جستجو
        <pre className="mt-2 text-xs">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
  if (
    !isLoading &&
    !convertedProducts.length &&
    !categories.length &&
    !brands.length
  ) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        {query
          ? `نتیجه‌ای برای «${query}» یافت نشد.`
          : "محصولی مطابق فیلتر یافت نشد."}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {searchTitle}
      </h1>

      {(categories.length > 0 || brands.length > 0) && (
        <div className="mb-8 rounded-lg bg-gray-50 p-4 shadow-sm">
          {categories.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">
                دسته‌بندی‌های مرتبط:
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="rounded-full bg-[#90E0EF] px-3 py-1 text-sm text-blue-800 hover:bg-[#00B4D8] hover:text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-700">
                برندهای مرتبط:
              </h2>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brands/${brand.slug}`}
                    className="rounded-full bg-[#90E0EF] px-3 py-1 text-sm text-blue-800 hover:bg-[#00B4D8] hover:text-white"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {convertedProducts.length > 0 || isLoading ? (
        <ProductsListingLayout
          title=""
          products={convertedProducts}
          sort={sort}
          setSort={handleSortChange}
          pagination={{ totalPages, currentPage: page }}
          setPage={handleSetPage}
          brands={brands}
          onClearFilters={clearFilters}
          isLoading={isLoading}
          isFiltering={isFetching && !isLoading}
        />
      ) : (
        <div className="py-10 text-center text-gray-600">
          {query
            ? `محصولی برای «${query}» یافت نشد.`
            : "محصولی مطابق فیلترهای انتخاب‌شده یافت نشد."}
        </div>
      )}
    </div>
  );
}
