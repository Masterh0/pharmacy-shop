"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";

import {
  searchApi,
  SortType,
  SearchResponse,
} from "@/lib/api/search";

import ProductsListingLayout from "@/src/components/products/ProductsListingLayout";
import type { Product } from "@/lib/types/product";
import { useLoading } from "@/src/components/LoadingProvider";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();

  // ✅ خواندن پارامترهای URL
  const query = searchParams.get("q") || "";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 12;
  const initialSort = (searchParams.get("sort") as SortType) || "newest";

  // ✅ State management
  const [sort, setSort] = useState<SortType>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [searchTitle, setSearchTitle] = useState("جستجو");

  // ✅ همگام‌سازی URL با state
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (sort !== "newest") params.set("sort", sort);
    else params.delete("sort");

    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [page, sort, limit, router, searchParams]);

  // ✅ Query برای دریافت داده‌ها
  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ["search", query, sort, page, limit],
    queryFn: async () => {
      showLoading("در حال جستجو...");
      try {
        const result = await searchApi.search({ 
          q: query, 
          sort, 
          page, 
          limit 
        });
        return result;
      } finally {
        hideLoading();
      }
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // ✅ فیلتر کردن محصولات
  const filteredProducts = useMemo(() => {
    return (data?.products ?? []).filter((p) => !p.isBlock);
  }, [data?.products]);

  const categories = data?.categories ?? [];
  const brands = data?.brands ?? [];
  const totalProducts = data?.total ?? 0;

  // ✅ محاسبه تعداد صفحات
  const totalPages = useMemo(() => {
    if (!totalProducts) return 1;
    return Math.ceil(totalProducts / limit);
  }, [totalProducts, limit]);

  // ✅ به‌روزرسانی عنوان جستجو
  useEffect(() => {
    setSearchTitle(query ? `نتایج جستجو برای: \`${query}\`` : "جستجو");
  }, [query]);

  // ✅ تبدیل محصولات به تایپ مورد نیاز
  const convertedProducts: Product[] = useMemo(
    () =>
      filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: "",
        description: "",
        imageUrl: p.imageUrl,
        isBlock: p.isBlock,
        brandId: null,
        categoryId: p.category?.id ?? null,
        category: p.category
          ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
            }
          : null,
        variants: (p.variants || []).map((v) => ({
          id: typeof v === "object" && "id" in v ? v.id : 0,
          price: Number(v.price) || 0,
          discountPrice: v.discountPrice ? Number(v.discountPrice) : 0,
          stock: typeof v === "object" && "stock" in v ? v.stock ?? 0 : 0,
          flavor:
            typeof v === "object" && "flavor" in v ? v.flavor ?? null : null,
          packageQuantity:
            typeof v === "object" && "packageQuantity" in v
              ? v.packageQuantity ?? null
              : null,
        })),
      })),
    [filteredProducts]
  );

  // ✅ هندلر تغییر صفحه
  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ✅ هندلر تغییر مرتب‌سازی
  const handleSortChange = useCallback((newSort: SortType) => {
    setSort(newSort);
  }, []);

  // ✅ وضعیت‌های مختلف کامپوننت
  if (!query) {
    return (
      <div className="container mx-auto py-20 text-center text-gray-600">
        لطفاً عبارت مورد نظر خود را در نوار جستجو وارد کنید.
      </div>
    );
  }

  if (isLoading) {
    return null; // Loading توسط LoadingProvider نمایش داده می‌شود
  }

  if (isError) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500">
        خطا در دریافت نتایج جستجو
        <pre className="text-xs mt-2">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!convertedProducts.length && !categories.length && !brands.length) {
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

      {convertedProducts.length > 0 ? (
        <ProductsListingLayout
          title=""
          products={convertedProducts}
          sort={sort}
          setSort={handleSortChange}
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
